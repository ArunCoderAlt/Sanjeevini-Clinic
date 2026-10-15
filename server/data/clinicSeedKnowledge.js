/**
 * Seed Knowledge Base for Sanjeevini Siddha & Ayurveda Medical Centre
 * Serves as the authoritative foundational context for RAG retrieval.
 */

const clinicSeedKnowledge = {
  documentName: 'Sanjeevini_Clinic_Portfolio_Guide.pdf',
  title: 'Sanjeevini Siddha & Ayurveda Medical Centre - Official Clinic Portfolio & Guide',
  sections: [
    {
      title: 'Clinic Overview & Location',
      content: `Sanjeevini Siddha & Ayurveda Medical Centre is a premier traditional healthcare clinic situated in Karaikal, Puducherry (U.T.), India. 
The clinic blends classical Siddha and Ayurvedic medicine to provide root-cause, holistic healing for both acute and chronic conditions.
Address: No. 22, Dr. Ambedkar Street, Karaikal - 609602, Puducherry (U.T.), India.
Primary Contact Number: +91 94431 89498
Official WhatsApp: +91 94431 89498
Official Email: sanjeevinisiddha@gmail.com
Google Maps Location: Located on Dr. Ambedkar Street in the heart of Karaikal, easily accessible by public and private transport.`
    },
    {
      title: 'Consultation Hours & Timings',
      content: `Consultation Hours at Sanjeevini Siddha & Ayurveda Medical Centre:
Monday to Saturday: 5:00 PM to 9:30 PM
Sunday: Closed (Emergency calls or WhatsApp inquiries only)
Patients are seen during the evening clinic hours from 5:00 PM to 9:30 PM. 
To consult our doctors, patients can visit directly during consultation hours or contact our front desk at +91 94431 89498 or send a WhatsApp message to arrange their visit.`
    },
    {
      title: 'Expert Doctors & Qualifications',
      content: `Our clinical team is led by highly qualified and experienced traditional medical practitioners:
1. Dr. Thiagarajan Saminadane
- Qualification: MD (Siddha)
- Experience: Over 20+ years of dedicated clinical practice
- Specialization: Classical Siddha Medicine, Nadi Parikshai (traditional pulse diagnosis), Varmam Vital Point Therapy, and Chronic Disease Reversal.
- Recognition: Gold Medalist in Siddha Medicine with over 15,000 successful patient consultations.
- Languages spoken: Tamil, English.

2. Dr. Subashini Ganesan
- Qualification: BAMS (Ayurveda)
- Experience: Over 15+ years of clinical practice
- Specialization: Ayurvedic Diagnostics, Panchakarma therapies, Women's Health (PCOD, hormonal balance), and Dietetics.
- Recognition: Specialist in classical Ayurvedic herbal preparations and preventive lifestyle care.
- Languages spoken: Tamil, English.`
    },
    {
      title: 'Core Services & Therapies',
      content: `The clinic specializes in three core traditional modalities:
1. Varmam Therapy:
An ancient Siddha healing science targeting vital energy points (Varmam points) where nerves, muscles, and energy meridians intersect. Precise manual pressure relieves trapped energy, restores conductivity, and alleviates spinal, cervical, sciatica, joint pain, and neuropathy without surgery.

2. Thokkanam Therapy:
Traditional Siddha physical manipulation and massage using warm medicated herbal oils. It incorporates nine classical touch techniques (kneading, tapping, gliding, traction) to penetrate muscular layers, eliminate lactic acid, nourish dry joints, reduce inflammatory stiffness, and promote deep nervous relaxation.

3. Wellness Support & Preventive Care:
Personalized constitutional lifestyle and dietary counseling (Pathya Aaharam) tailored to the patient's individual Dosha balance (Vatham, Pitham, Kapham), coupled with seasonal rejuvenative herbal tonics (Rasayana Chikitsa).`
    },
    {
      title: 'Diagnostic Methodology - Nadi Parikshai (Pulse Diagnosis)',
      content: `Diagnosis at Sanjeevini Siddha & Ayurveda Medical Centre is grounded in classical Eight-Fold Examination (Envagai Thervu) and Nadi Parikshai (Pulse Diagnosis).
By palpating the radial pulse at three distinct depths, our physicians assess the balance of the three fundamental bodily humors:
- Vatham (Air & Space - controls movement, nervous system, and circulation)
- Pitham (Fire & Water - governs digestion, metabolism, liver, and body temperature)
- Kapham (Water & Earth - regulates structural stability, lubrication, and respiratory mucosal immunity)
Pulse diagnosis detects deep metabolic and systemic imbalances before physical symptoms fully manifest, enabling targeted, non-invasive treatment.`
    },
    {
      title: 'Key Medical Conditions Treated',
      content: `Sanjeevini Clinic provides specialized traditional treatment for:
- Musculoskeletal Disorders: Arthritis (Osteoarthritis, Rheumatoid), Cervical & Lumbar Spondylosis, Sciatica, Frozen Shoulder, Slip Disc, and Chronic Back Pain.
- Gastrointestinal Issues: Peptic Ulcers, Acid Reflux (GERD), Irritable Bowel Syndrome (IBS), Chronic Indigestion, and Constipation.
- Skin & Dermatology: Psoriasis, Eczema, Dermatitis, Acne, and Allergic Rashes using non-steroidal herbal therapies.
- Respiratory Illnesses: Chronic Sinusitis, Bronchial Asthma, Allergic Rhinitis, Bronchitis, and Wheezing.
- Neurological Conditions: Migraine headaches, Peripheral Neuropathy, Facial Palsy, Neuralgia, and post-stroke rehabilitation support.
- Women's Health: PCOD/PCOS, Irregular Menstruation, Menopausal discomfort, and Hormonal optimization.
- Kidney & Urinary Health: Kidney stones (Renal Calculi), recurrent Urinary Tract Infections (UTI), and prostate health.`
    },
    {
      title: 'Medicines, Formulations & Quality',
      content: `All herbal medicines and formulations prescribed at Sanjeevini Siddha & Ayurveda are authentic, classical preparations:
- Sourced from government-licensed, GMP-certified traditional pharmacies.
- Formulations include single-herb powders (Choornams), medicated decoctions (Kashayams/Kudineer), herbal tablets (Vathis/Gulis), medicated ghee (Ghrithams), and external oils (Thailams).
- Free from harmful chemicals, heavy metal contamination, or synthetic preservatives.
- Formulations are strictly tailored to individual patient constitution and age.`
    },
    {
      title: 'Appointments, Inquiries & Consultation Process',
      content: `How to Consult or Contact Sanjeevini Clinic:
- In-person clinic visits: Patients can walk in Monday through Saturday between 5:00 PM and 9:30 PM at No. 22, Dr. Ambedkar Street, Karaikal.
- Phone inquiries: Call +91 94431 89498 for quick information regarding treatment availability, directions, or timings.
- WhatsApp inquiries: Message +91 94431 89498 anytime to ask general questions or confirm doctor presence.
- Website inquiry form: Use the "Contact Us" form on the website to submit detailed questions, and the clinic team responds promptly.`
    }
  ]
};

module.exports = clinicSeedKnowledge;
