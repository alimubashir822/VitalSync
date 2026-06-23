'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function askAiAssistantAction(userMessage: string, chatHistory: { role: 'user' | 'assistant'; content: string }[]) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized.' };

  const patientId = session.patientId;
  if (!patientId) {
    return { response: 'Hello! I am the VitalSync Clinical Assistant. How can I help you manage your clinical workflow today?' };
  }

  try {
    // 1. Fetch patient's clinical context
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        bloodPressureRecords: { orderBy: { timestamp: 'desc' }, take: 5 },
        glucoseRecords: { orderBy: { timestamp: 'desc' }, take: 5 },
        heartRateRecords: { orderBy: { timestamp: 'desc' }, take: 5 },
        medications: { where: { isActive: true } },
        carePlans: { where: { isActive: true } },
      },
    });

    if (!patient) return { response: 'Patient context not found.' };

    const recentBP = patient.bloodPressureRecords[0];
    const recentGlucose = patient.glucoseRecords[0];
    const recentHR = patient.heartRateRecords[0];
    const activeMeds = patient.medications.map(m => `${m.name} (${m.dosage}, ${m.frequency})`).join(', ');

    // 2. If OpenAI key is present, use it!
    if (OPENAI_API_KEY) {
      try {
        const systemPrompt = `
You are VitalSync AI, a remote patient monitoring chronic care intelligence assistant. 
You are speaking to patient ${session.name} (DOB: ${patient.dateOfBirth.toDateString()}).
Patient's Chronic Conditions: ${patient.chronicConditions}
Active Medications: ${activeMeds || 'None'}
Primary Provider: Dr. Chen (Cardiologist)
Latest Vitals Logged:
- Blood Pressure: ${recentBP ? `${recentBP.systolic}/${recentBP.diastolic} mmHg` : 'None'}
- Glucose Level: ${recentGlucose ? `${recentGlucose.value} mg/dL` : 'None'}
- Heart Rate: ${recentHR ? `${recentHR.bpm} BPM` : 'None'}

Goal: Explain trends, encourage medication adherence, and explain care plans.
CRITICAL RULES:
1. Provide decision support and educational insights. DO NOT provide a final medical diagnosis.
2. If readings are highly critical (BP >= 160/100, Glucose <= 60), advise sitting down, resting, checking readings again, and contacting their provider or emergency services.
3. Be professional, supportive, and concise.
`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...chatHistory.map(h => ({ role: h.role, content: h.content })),
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 400,
          }),
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
          return { response: data.choices[0].message.content };
        }
      } catch (err) {
        console.error('OpenAI fetch error, falling back to rule engine:', err);
      }
    }

    // 3. Robust Context-Aware Rule Engine (Fallback)
    const lowerMessage = userMessage.toLowerCase();
    let responseText = '';

    if (lowerMessage.includes('bp') || lowerMessage.includes('blood pressure') || lowerMessage.includes('hypertension')) {
      if (recentBP) {
        const isHigh = recentBP.systolic >= 140 || recentBP.diastolic >= 90;
        const isCritical = recentBP.systolic >= 160 || recentBP.diastolic >= 100;

        if (isCritical) {
          responseText = `Your last logged blood pressure was **${recentBP.systolic}/${recentBP.diastolic} mmHg** (logged recently). This is in the **Stage 2 Hypertension critical range**. 
          
⚠️ **Action Plan:**
1. I have triggered a **Critical Alert** on the clinician dashboard. Dr. Chen has been notified.
2. Sit down, breathe deeply, and rest. Avoid physical stress.
3. Measure your blood pressure again in 30 minutes.
4. Ensure you have taken your prescribed **Lisinopril**.
5. *If you experience chest pain, shortness of breath, or numbness, please call emergency services (911) immediately.*`;
        } else if (isHigh) {
          responseText = `Your latest blood pressure reading is **${recentBP.systolic}/${recentBP.diastolic} mmHg**. This is slightly elevated above your goal of < 130/80 mmHg.
          
**Suggestions:**
- Continue to log your BP twice daily as scheduled.
- Keep sodium intake low as outlined in your **DASH diet care guidelines**.
- Check if you have missed any of your daily medication doses (Lisinopril/Amlodipine).`;
        } else {
          responseText = `Your latest blood pressure is **${recentBP.systolic}/${recentBP.diastolic} mmHg**, which is **stable** and aligns nicely with your clinical goal of < 130/80 mmHg. Excellent work keeping up with your monitoring and medication!`;
        }
      } else {
        responseText = `I don't see any blood pressure readings logged recently. You can record your first reading using the "Log Vital Reading" form above, and I can help analyze your trends.`;
      }
    } else if (lowerMessage.includes('glucose') || lowerMessage.includes('sugar') || lowerMessage.includes('diabetes')) {
      if (recentGlucose) {
        const isHigh = recentGlucose.value >= 140;
        const isLow = recentGlucose.value <= 70;

        if (isLow) {
          responseText = `Your latest glucose reading of **${recentGlucose.value} mg/dL** indicates **hypoglycemia (low blood sugar)**. 
          
⚠️ **Action Plan:**
- Consume 15 grams of fast-acting carbohydrates immediately (e.g., 4 ounces of fruit juice, half a can of regular soda, or 3-4 glucose tablets).
- Rest and re-test your glucose in 15 minutes.
- If it remains low, repeat the treatment. Please notify Emily Jackson or your care coordinator.`;
        } else if (isHigh) {
          responseText = `Your latest glucose is **${recentGlucose.value} mg/dL** (${recentGlucose.isFasting ? 'Fasting' : 'Post-Meal'}). This is slightly elevated.
          
**Suggestions:**
- Review your carbohydrate intake for your last meal.
- Ensure you have taken your scheduled **Metformin**.
- Drink plenty of water and engage in light movement (like a short walk) to help stabilize your levels.`;
        } else {
          responseText = `Your latest glucose level is **${recentGlucose.value} mg/dL**, which is **stable** and within your target chronic care range. Keep up the consistent meal tracking and log entries!`;
        }
      } else {
        responseText = `I don't see any glucose records logged today. Please submit a blood sugar reading using the logger tool so we can verify your current trend.`;
      }
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('pill') || lowerMessage.includes('drug')) {
      responseText = `Based on your active care plans, you are currently prescribed:
${patient.medications.map(m => `- **${m.name} ${m.dosage}** (${m.frequency}): Scheduled for *${m.scheduleTime}*. ${m.instructions || ''}`).join('\n')}

**Adherence Note:** Taking your medications consistently every day is the most important factor in keeping your chronic vitals stable. If you experience side effects, please send Dr. Chen a secure message rather than skipping doses.`;
    } else {
      responseText = `Hello Sarah! I can help you analyze your vitals trends, explain your care goals, or check your medication schedules. For example, you can ask me:
- *"Explain my blood pressure trend"*
- *"What should I do if my glucose is high?"*
- *"Show my medication schedule"*

*(Note: I provide decision support and educational insights. For any changes to dosages or severe symptoms, please consult Dr. Chen directly.)*`;
    }

    return { response: responseText };
  } catch (error) {
    console.error('AI assistant error:', error);
    return { response: 'Sorry, I encountered an issue analyzing your records. Please try again.' };
  }
}
export async function getPatientMessages(receiverId: string) {
  const session = await getSession();
  if (!session) return [];

  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.userId, receiverId },
        { senderId: receiverId, receiverId: session.userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });
}
