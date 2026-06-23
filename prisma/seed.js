const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Clearing database...');
  // Delete in order of dependencies
  await prisma.auditLog.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.carePlan.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.heartRateRecord.deleteMany({});
  await prisma.glucoseRecord.deleteMany({});
  await prisma.bloodPressureRecord.deleteMany({});
  await prisma.vitalReading.deleteMany({});
  await prisma.device.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleared.');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'VitalSync AI Medical Center',
      address: '742 Evergreen Terrace, Sector 4, Health City',
    },
  });

  // 2. Create Users (hashed passwords for safety: 'password123')
  const demoPasswordHash = hashPassword('password123');

  const usersData = [
    { email: 'doctor.chen@vitalsync.com', name: 'Dr. Robert Chen', role: 'DOCTOR', passwordHash: demoPasswordHash },
    { email: 'nurse.emily@vitalsync.com', name: 'Nurse Emily Jackson', role: 'CARE_TEAM', passwordHash: demoPasswordHash },
    { email: 'sarah.jenkins@vitalsync.com', name: 'Sarah Jenkins', role: 'PATIENT', passwordHash: demoPasswordHash },
    { email: 'john.smith@vitalsync.com', name: 'John Smith', role: 'PATIENT', passwordHash: demoPasswordHash },
    { email: 'michael.miller@vitalsync.com', name: 'Michael Miller', role: 'PATIENT', passwordHash: demoPasswordHash },
    { email: 'admin@vitalsync.com', name: 'Chief Admin Officer', role: 'ADMIN', passwordHash: demoPasswordHash },
  ];

  const users = {};
  for (const u of usersData) {
    users[u.email] = await prisma.user.create({ data: u });
  }

  // 3. Create Providers
  const drChen = await prisma.provider.create({
    data: {
      userId: users['doctor.chen@vitalsync.com'].id,
      orgId: org.id,
      specialty: 'Cardiologist & Hypertension Specialist',
    },
  });

  const nurseEmily = await prisma.provider.create({
    data: {
      userId: users['nurse.emily@vitalsync.com'].id,
      orgId: org.id,
      specialty: 'Chronic Care Nurse Practitioner',
    },
  });

  // 4. Create Patients
  const sarah = await prisma.patient.create({
    data: {
      userId: users['sarah.jenkins@vitalsync.com'].id,
      orgId: org.id,
      dateOfBirth: new Date('1981-04-12'),
      phoneNumber: '+1 (555) 123-4567',
      emergencyContact: 'David Jenkins (Husband) - +1 (555) 123-4568',
      chronicConditions: 'Hypertension',
      riskScore: 85, // High Risk due to rising BP
      primaryProviderId: drChen.id,
    },
  });

  const john = await prisma.patient.create({
    data: {
      userId: users['john.smith@vitalsync.com'].id,
      orgId: org.id,
      dateOfBirth: new Date('1964-09-22'),
      phoneNumber: '+1 (555) 234-5678',
      emergencyContact: 'Mary Smith (Wife) - +1 (555) 234-5679',
      chronicConditions: 'Diabetes (Type 2)',
      riskScore: 45, // Stable
      primaryProviderId: nurseEmily.id,
    },
  });

  const michael = await prisma.patient.create({
    data: {
      userId: users['michael.miller@vitalsync.com'].id,
      orgId: org.id,
      dateOfBirth: new Date('1956-11-05'),
      phoneNumber: '+1 (555) 345-6789',
      emergencyContact: 'Helen Miller (Wife) - +1 (555) 345-6780',
      chronicConditions: 'Cardiac Care, Hypertension',
      riskScore: 68, // Moderate attention
      primaryProviderId: drChen.id,
    },
  });

  // 5. Connect Devices
  await prisma.device.createMany({
    data: [
      {
        patientId: sarah.id,
        name: 'Omron 5 Series Smart BP Monitor',
        type: 'BP_MONITOR',
        serialNumber: 'OM-BP-9921',
        status: 'CONNECTED',
        lastSyncedAt: new Date(),
      },
      {
        patientId: john.id,
        name: 'Dexcom G6 Continuous Glucose Monitor',
        type: 'GLUCOMETER',
        serialNumber: 'DX-CGM-1022',
        status: 'CONNECTED',
        lastSyncedAt: new Date(),
      },
      {
        patientId: michael.id,
        name: 'Apple Watch Series 9 (ECG Enabled)',
        type: 'WEARABLE',
        serialNumber: 'AW-9-ECG-3382',
        status: 'CONNECTED',
        lastSyncedAt: new Date(),
      },
    ],
  });

  // 6. Create Vital Records for Sarah (Hypertension trends + alert)
  // Let's create readings for the last 30 days
  const bpReadings = [
    { sys: 120, dia: 80, hr: 72, offset: 30 },
    { sys: 122, dia: 82, hr: 74, offset: 25 },
    { sys: 125, dia: 84, hr: 75, offset: 20 },
    { sys: 130, dia: 88, hr: 78, offset: 15 },
    { sys: 135, dia: 90, hr: 80, offset: 10 },
    { sys: 140, dia: 92, hr: 82, offset: 5 },
    { sys: 142, dia: 92, hr: 84, offset: 2 },
    { sys: 165, dia: 102, hr: 90, offset: 0 }, // Critical reading today!
  ];

  for (const r of bpReadings) {
    const timestamp = new Date(Date.now() - r.offset * 24 * 60 * 60 * 1000);
    const isAbnormal = r.sys >= 140 || r.dia >= 90;

    await prisma.bloodPressureRecord.create({
      data: {
        patientId: sarah.id,
        systolic: r.sys,
        diastolic: r.dia,
        heartRate: r.hr,
        notes: r.offset === 0 ? 'Felt slightly dizzy before taking reading.' : 'Automated log from Omron BP.',
        timestamp,
      },
    });

    await prisma.vitalReading.create({
      data: {
        patientId: sarah.id,
        type: 'BLOOD_PRESSURE',
        timestamp,
        valueJson: JSON.stringify({ systolic: r.sys, diastolic: r.dia, heartRate: r.hr }),
        isAbnormal,
      },
    });
  }

  // 7. Create Vital Records for John (Diabetes: fasting/post-meal glucose)
  const glucoseReadings = [
    { value: 98, fasting: true, phase: 'BEFORE_MEAL', offset: 7 },
    { value: 145, fasting: false, phase: 'AFTER_MEAL', offset: 6 },
    { value: 110, fasting: true, phase: 'BEFORE_MEAL', offset: 5 },
    { value: 132, fasting: false, phase: 'AFTER_MEAL', offset: 4 },
    { value: 105, fasting: true, phase: 'BEFORE_MEAL', offset: 3 },
    { value: 158, fasting: false, phase: 'AFTER_MEAL', offset: 2 },
    { value: 112, fasting: true, phase: 'BEFORE_MEAL', offset: 1 },
    { value: 120, fasting: true, phase: 'BEFORE_MEAL', offset: 0 },
  ];

  for (const r of glucoseReadings) {
    const timestamp = new Date(Date.now() - r.offset * 24 * 60 * 60 * 1000);
    const isAbnormal = r.value >= 140 && r.fasting; // Fasting over 140 is high

    await prisma.glucoseRecord.create({
      data: {
        patientId: john.id,
        value: r.value,
        isFasting: r.fasting,
        mealPhase: r.phase,
        notes: 'Synced via Dexcom App.',
        timestamp,
      },
    });

    await prisma.vitalReading.create({
      data: {
        patientId: john.id,
        type: 'GLUCOSE',
        timestamp,
        valueJson: JSON.stringify({ glucose: r.value, isFasting: r.fasting, mealPhase: r.phase }),
        isAbnormal,
      },
    });
  }

  // 8. Create Vital Records for Michael (Cardiac: heart rate)
  const hrReadings = [
    { bpm: 62, type: 'RESTING', offset: 5 },
    { bpm: 128, type: 'ACTIVE', offset: 4 },
    { bpm: 58, type: 'SLEEP', offset: 3 },
    { bpm: 64, type: 'RESTING', offset: 2 },
    { bpm: 142, type: 'ACTIVE', offset: 1 },
    { bpm: 60, type: 'RESTING', offset: 0 },
  ];

  for (const r of hrReadings) {
    const timestamp = new Date(Date.now() - r.offset * 24 * 60 * 60 * 1000);
    const isAbnormal = r.bpm >= 140 && r.type === 'RESTING';

    await prisma.heartRateRecord.create({
      data: {
        patientId: michael.id,
        bpm: r.bpm,
        type: r.type,
        notes: 'Logged via Apple Health Sync.',
        timestamp,
      },
    });

    await prisma.vitalReading.create({
      data: {
        patientId: michael.id,
        type: 'HEART_RATE',
        timestamp,
        valueJson: JSON.stringify({ bpm: r.bpm, measurementType: r.type }),
        isAbnormal,
      },
    });
  }

  // 9. Create Alerts
  const criticalBpAlert = await prisma.alert.create({
    data: {
      patientId: sarah.id,
      type: 'CRITICAL_BP',
      message: 'Critical blood pressure reading detected: 165/102 mmHg (Systolic/Diastolic limit exceeded).',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      createdAt: new Date(),
    },
  });

  const highGlucoseAlert = await prisma.alert.create({
    data: {
      patientId: john.id,
      type: 'HIGH_GLUCOSE',
      message: 'Fasting glucose level slightly elevated: 120 mg/dL.',
      severity: 'WARNING',
      status: 'RESOLVED',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      acknowledgedById: nurseEmily.id,
      acknowledgedAt: new Date(Date.now() - 2.9 * 24 * 60 * 60 * 1000),
      resolutionNotes: 'Patient was advised to adjust evening insulin dose. Reading returned to baseline.',
    },
  });

  // 10. Create Medications
  await prisma.medication.createMany({
    data: [
      {
        patientId: sarah.id,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once Daily',
        instructions: 'Take in the morning with food. Do not skip doses.',
        scheduleTime: '08:00 AM',
        isActive: true,
      },
      {
        patientId: sarah.id,
        name: 'Amlodipine Besylate',
        dosage: '5mg',
        frequency: 'Once Daily',
        instructions: 'Take in the evening before bedtime.',
        scheduleTime: '08:00 PM',
        isActive: true,
      },
      {
        patientId: john.id,
        name: 'Metformin Hydrochloride',
        dosage: '500mg',
        frequency: 'Twice Daily',
        instructions: 'Take with meals (breakfast and dinner).',
        scheduleTime: '08:00 AM',
        isActive: true,
      },
      {
        patientId: michael.id,
        name: 'Metoprolol Succinate',
        dosage: '25mg',
        frequency: 'Once Daily',
        instructions: 'Take in the morning with breakfast.',
        scheduleTime: '08:00 AM',
        isActive: true,
      },
    ],
  });

  // 11. Create Care Plans
  await prisma.carePlan.create({
    data: {
      patientId: sarah.id,
      creatorId: drChen.id,
      title: 'Hypertension Management Protocol',
      goal: 'Achieve stable systolic blood pressure < 130 mmHg and diastolic < 80 mmHg.',
      instructions: '1. Log Blood Pressure twice daily (8:00 AM and 8:00 PM).\n2. Maintain a low-sodium DASH diet (< 2000mg salt/day).\n3. Alert provider immediately if systolic exceeds 160 or diastolic exceeds 100.',
      startDate: new Date(),
      isActive: true,
    },
  });

  await prisma.carePlan.create({
    data: {
      patientId: john.id,
      creatorId: nurseEmily.id,
      title: 'Type 2 Diabetes Control Plan',
      goal: 'Maintain fasting blood sugar between 80-130 mg/dL and HbA1c < 7.0%.',
      instructions: '1. Check glucose fasting in the morning and 2 hours after largest meal.\n2. Engage in 30 minutes of moderate aerobic exercise 5 days a week.\n3. Keep diet log tracking daily carbohydrates intake.',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // 12. Create Messages
  const drChenUser = users['doctor.chen@vitalsync.com'];
  const nurseEmilyUser = users['nurse.emily@vitalsync.com'];
  const sarahUser = users['sarah.jenkins@vitalsync.com'];
  const johnUser = users['john.smith@vitalsync.com'];

  await prisma.message.createMany({
    data: [
      {
        senderId: sarahUser.id,
        receiverId: drChenUser.id,
        content: 'Hello Dr. Chen, I logged my vitals today and noticed my blood pressure is higher than usual. I also felt a bit lightheaded.',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        senderId: drChenUser.id,
        receiverId: sarahUser.id,
        content: 'Hi Sarah. I see your reading is 165/102, which is critical. Please take your extra Amlodipine dose as prescribed, sit down to rest, and log your BP again in 30 minutes. If you feel chest pain or severe shortness of breath, please call 911 immediately.',
        createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      },
      {
        senderId: sarahUser.id,
        receiverId: drChenUser.id,
        content: 'Thank you doctor, I took the medication and am resting now. I will measure again in 20 minutes.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        senderId: johnUser.id,
        receiverId: nurseEmilyUser.id,
        content: 'Hi Emily, my fasting glucose was 120 this morning. Should I adjust my insulin dose?',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isRead: true,
      },
      {
        senderId: nurseEmilyUser.id,
        receiverId: johnUser.id,
        content: 'Hi John, 120 mg/dL is within a safe fasting range for your care plan. Keep tracking for the next 3 days, and we will review it during our check-in next Monday.',
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
        isRead: true,
      },
    ],
  });

  // 13. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: users['admin@vitalsync.com'].id,
        action: 'PROVISION_ORGANIZATION',
        resource: `Org: ${org.name}`,
        details: 'Provisioned VitalSync AI primary medical center.',
      },
      {
        userId: drChenUser.id,
        action: 'VIEW_PATIENT_RECORD',
        resource: `Patient: ${sarah.id}`,
        details: 'Viewed patient chart due to critical blood pressure reading alert.',
      },
      {
        userId: nurseEmilyUser.id,
        action: 'RESOLVE_ALERT',
        resource: `Alert: ${highGlucoseAlert.id}`,
        details: 'Resolved elevated glucose alert; adjusted patient instructions.',
      },
    ],
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
