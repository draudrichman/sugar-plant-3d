/* The 15 plants: her document's words, in one place.

   Each plant's model lives in plants/<id>.js. Everything here is content:
   the cards, the potions and what the plant is showing. Decoy cards are drawn
   from the other plants' correct cards, so a card that saves one plant is a
   wrong answer on another, as in Dark Arts.

   Source: "Mother Nature's Magical Herbology Garden" (her doc) and the deck
   slides saved in refs/. Prolapsed Umbilical Cord was written up separately at the end of her doc. */

export const CATALOG = [
  {
    id: 'mastitis', n: 1, name: 'The Mastitis Sprite', condition: 'Mastitis', ref: 'p14_0.jpg',
    pathology: 'Inflammation of breast tissue during lactation, sometimes involving bacterial infection, commonly Staphylococcus aureus.',
    signs: ['Red, warm, swollen, painful breast', 'Fever, chills, fatigue', 'Localized tenderness or firm area', 'Flu-like symptoms'],
    tools: [
      { id: 'milk-flow-can', ic: '💧', name: 'Milk-Flow Watering Can', why: 'Help the rose maintain its normal sap flow. Continue breastfeeding or expressing milk as needed without excessive pumping.' },
      { id: 'cooling-petal-compress', ic: '🍃', name: 'Cooling Petal Compress', why: 'Place a cooling leaf over the inflamed petals. Apply cold compresses to reduce swelling and discomfort.' },
      { id: 'resting-soil', ic: '🛏️', name: 'Resting Soil', why: 'Move the rose into a quiet recovery bed. Encourage rest, hydration, and supportive care.' },
      { id: 'abscess-lens', ic: '🔍', name: 'Abscess-Detecting Lens', why: 'Inspect for a persistent collection of infected sap. Assess for breast abscess if symptoms worsen or fail to improve.' },
    ],
    potions: 'Ibuprofen or acetaminophen for pain and fever; dicloxacillin or cephalexin when bacterial mastitis requires antibiotics.',
  },
  {
    id: 'sugar-plant', n: 2, name: 'The Sugar Plant', condition: 'Gestational Diabetes', ref: 'p15_0.jpg',
    pathology: 'Pregnancy hormones increase insulin resistance, causing maternal hyperglycemia when insulin production cannot compensate.',
    signs: ['Often asymptomatic', 'Increased thirst or urination', 'Fatigue', 'Elevated glucose screening results', 'Possible excessive fetal growth (a big baby!)'],
    tools: [
      { id: 'sugar-sap-kit', ic: '🧪', name: 'Sugar-Sap Testing Kit', why: "Test the sweetness of the bush's sap. Monitor fasting and post-meal blood glucose." },
      { id: 'balanced-fertilizer', ic: '🥗', name: 'Balanced Nutrient Fertilizer', why: 'Provide measured nutrients rather than excessive sugar. Teach individualized meal planning and carbohydrate distribution.' },
      { id: 'sunlight-path', ic: '☀️', name: 'Sunlight Walking Path', why: 'Give the plant appropriate movement and sunlight. Encourage safe physical activity as tolerated.' },
      { id: 'fruit-growth-scanner', ic: '📏', name: 'Fruit-Growth Scanner', why: 'Check whether the berries are growing too large. Monitor fetal growth and arrange indicated antenatal surveillance.' },
    ],
    potions: 'Insulin is the preferred medication when lifestyle measures are insufficient; metformin may be considered in selected cases under clinician guidance.',
  },
  {
    id: 'abruptor', n: 3, name: 'The Abruptor', condition: 'Placental Abruption', ref: 'p16_0.jpg',
    pathology: 'The placenta separates prematurely from the uterine wall, compromising maternal blood loss and fetal oxygen delivery.',
    signs: ['Sudden abdominal or back pain', 'Dark vaginal bleeding, which may be concealed', 'Rigid or tender uterus', 'Frequent contractions', 'Fetal distress', 'Maternal shock in severe cases'],
    tools: [
      { id: 'emergency-garden-bell', ic: '🔔', name: 'Emergency Garden Bell', why: 'Summon Mother Nature immediately. Activate emergency obstetric response.' },
      { id: 'root-life-monitor', ic: '💓', name: 'Root-Life Monitor', why: "Watch the plant's roots and pulse continuously. Monitor maternal vital signs and fetal heart rate." },
      { id: 'restoration-water-lines', ic: '🩸', name: 'Restoration Water Lines', why: 'Connect large emergency irrigation lines. Establish large-bore IV access and administer prescribed fluids or blood products.' },
      { id: 'transplant-chamber', ic: '🚑', name: 'Emergency Transplant Chamber', why: 'Prepare the plant for urgent transfer. Prepare for expedited delivery when indicated by maternal or fetal condition.' },
    ],
    potions: 'IV fluids and blood products as needed; antenatal corticosteroids may be considered in selected stable preterm cases when delivery is not immediately necessary. No medication reattaches the placenta.',
  },
  {
    id: 'previa', n: 4, name: 'The Low-Lying Protector', condition: 'Placenta Previa', ref: 'p24_0.jpg',
    pathology: 'The placenta covers the internal cervical opening. A low-lying placenta is close to, but does not cover, the opening.',
    signs: ['Painless, bright-red vaginal bleeding', 'Soft, usually nontender uterus', 'Possible recurrent bleeding', 'Possible abnormal fetal presentation'],
    tools: [
      { id: 'crystal-root-scanner', ic: '🔮', name: 'Crystal Root Scanner', why: 'Locate the roots without disturbing the soil. Use ultrasound to identify placental location.' },
      { id: 'do-not-dig-sign', ic: '🚫', name: 'Do-Not-Dig Sign', why: 'Never insert tools into the soil opening. Avoid digital vaginal examinations until placenta previa has been excluded.' },
      { id: 'bleeding-watch-lantern', ic: '🏮', name: 'Bleeding-Watch Lantern', why: 'Observe leaking red sap. Monitor bleeding, maternal vital signs, and fetal status.' },
      { id: 'protected-bloom-chamber', ic: '🏥', name: 'Protected Bloom Chamber', why: 'Prepare for cesarean delivery when the placenta covers the cervical opening.' },
    ],
    potions: 'Antenatal corticosteroids when indicated for threatened preterm delivery; IV fluids and blood products if needed. Anti-D immune globulin for eligible Rh-negative patients after bleeding.',
  },
  {
    id: 'gesta', n: 5, name: 'Gesta, the Hypertensive Bloom', condition: 'Gestational Hypertension', ref: 'p17_0.jpg',
    pathology: 'New-onset blood pressure of at least 140/90 mmHg after 20 weeks of pregnancy, without proteinuria or other diagnostic features of preeclampsia.',
    signs: ['Elevated blood pressure', 'Often no symptoms', 'May progress to preeclampsia'],
    tools: [
      { id: 'vine-pressure-gauge', ic: '🩺', name: 'Vine Pressure Gauge', why: 'Measure pressure inside the twisting vines. Monitor blood pressure regularly.' },
      { id: 'soil-sample-station', ic: '⚗️', name: 'Soil Sample Station', why: 'Check the soil for signs of worsening disease. Monitor urine protein, platelet count, kidney function, and liver enzymes as indicated.' },
      { id: 'warning-petal-watch', ic: '👁️', name: 'Warning-Petal Watch', why: 'Watch for new headaches, visual changes, or upper abdominal pain.' },
      { id: 'bloom-calendar', ic: '📅', name: 'Bloom Monitoring Calendar', why: 'Arrange maternal and fetal surveillance and delivery planning.' },
    ],
    potions: 'Labetalol, nifedipine, or hydralazine for severe hypertension; medication for nonsevere hypertension depends on clinical circumstances.',
  },
  {
    id: 'clam-plant', n: 6, name: 'The Pre-eclampsia Clam Plant', condition: 'Pre-eclampsia', ref: 'p18_0.jpg',
    pathology: 'Pregnancy-related endothelial dysfunction and abnormal placental signaling produce new-onset hypertension with proteinuria and/or maternal organ dysfunction, usually after 20 weeks.',
    signs: ['High blood pressure', 'Proteinuria may be present', 'Persistent headache', 'Visual disturbances', 'Right upper quadrant or epigastric pain', 'Pulmonary edema or reduced urine output in severe cases'],
    tools: [
      { id: 'lightning-shield', ic: '🛡️', name: 'Lightning Shield', why: 'Protect the flower from dangerous electrical storms. Institute seizure precautions.' },
      { id: 'pressure-release-gauge', ic: '⏲️', name: 'Pressure-Release Gauge', why: 'Monitor and treat severe blood pressure elevations.' },
      { id: 'measured-watering-can', ic: '🚿', name: 'Measured Watering Can', why: 'Avoid flooding the roots. Strictly monitor intake and output and assess for pulmonary edema.' },
      { id: 'storm-laboratory', ic: '🔬', name: 'Storm Laboratory', why: 'Check platelets, creatinine, liver enzymes, and urine protein as indicated.' },
      { id: 'bloom-delivery-portal', ic: '🌀', name: 'Bloom Delivery Portal', why: 'Prepare for delivery at the appropriate gestational age or sooner when clinically necessary.' },
    ],
    potions: 'Magnesium sulfate for seizure prevention in preeclampsia with severe features; labetalol, hydralazine, or nifedipine for severe hypertension.',
  },
  {
    id: 'eclampsia', n: 7, name: 'The Storm Clam', condition: 'Eclampsia', ref: 'p19_1.jpg',
    pathology: 'New-onset seizures associated with preeclampsia that are not attributable to another cause.',
    signs: ['Tonic-clonic seizures', 'Possible headache or visual changes beforehand', 'Altered consciousness', 'Possible severe hypertension', 'Possible fetal heart rate abnormalities'],
    tools: [
      { id: 'storm-shelter', ic: '⛺', name: 'Storm Shelter', why: 'Protect the orchid from injury during a lightning strike. Protect the patient during seizures without restraining them or putting anything in their mouth.' },
      { id: 'airway-breeze-fan', ic: '🌬️', name: 'Airway Breeze Fan', why: 'Restore oxygen flow after the storm. Maintain airway and breathing, position laterally when possible, and provide oxygen if indicated.' },
      { id: 'magnesium-storm-potion', ic: '⚡', name: 'Magnesium Storm Potion', why: 'Administer prescribed magnesium sulfate and monitor respirations, reflexes, and urine output.' },
      { id: 'emergency-bloom-signal', ic: '🚨', name: 'Emergency Bloom Signal', why: 'Activate emergency obstetric response and prepare for delivery after stabilization.' },
    ],
    potions: 'Magnesium sulfate is first-line; IV calcium gluconate is the antidote for magnesium toxicity. Antihypertensives treat concurrent severe hypertension.',
  },
  {
    id: 'ectopic', n: 8, name: 'The Wrong-Place Sprout', condition: 'Ectopic Pregnancy', ref: 'p20_0.jpg',
    pathology: 'A fertilized egg implants outside the uterine cavity, most commonly in a fallopian tube. Rupture can cause life-threatening hemorrhage.',
    signs: ['Unilateral pelvic or abdominal pain', 'Vaginal spotting or bleeding', 'Missed period', 'Shoulder-tip pain if internal bleeding occurs', 'Dizziness, syncope, or shock with rupture'],
    tools: [
      { id: 'seed-finding-crystal', ic: '💎', name: 'Seed-Finding Crystal', why: 'Locate the seed. Arrange transvaginal ultrasound and serial quantitative hCG testing.' },
      { id: 'cracked-pot-bell', ic: '🛎️', name: 'Cracked-Pot Emergency Bell', why: 'Recognize signs of rupture and activate emergency care.' },
      { id: 'sap-replacement-lines', ic: '💉', name: 'Sap Replacement Lines', why: 'Establish IV access and prepare blood products when hemorrhage is suspected.' },
      { id: 'surgical-seed-removal', ic: '✂️', name: 'Surgical Seed Removal', why: 'Arrange prescribed surgical treatment when indicated. An ectopic pregnancy cannot safely be transplanted into the uterus.' },
    ],
    potions: 'Methotrexate for carefully selected stable, unruptured ectopic pregnancies; anti-D immune globulin according to applicable guidance for eligible Rh-negative patients.',
  },
  {
    id: 'mole', n: 9, name: 'The Bubble-Cluster Vine', condition: 'Hydatidiform Mole', ref: 'p21_0.jpg',
    pathology: 'Abnormal fertilization causes abnormal trophoblastic proliferation. Complete and partial molar pregnancies differ in their genetic makeup and fetal tissue findings.',
    signs: ['Vaginal bleeding', 'Excessive nausea or vomiting', 'High hCG levels', 'Uterus sometimes larger than expected', 'Possible early preeclampsia or hyperthyroidism'],
    tools: [
      { id: 'bubble-cluster-scanner', ic: '🫧', name: 'Bubble-Cluster Scanner', why: 'Identify abnormal growth with ultrasound and quantitative hCG testing.' },
      { id: 'abnormal-growth-removal', ic: '🧹', name: 'Abnormal Growth Removal', why: 'Prepare for suction evacuation of the uterus.' },
      { id: 'regrowth-detector', ic: '📡', name: 'Regrowth Detector', why: 'Check for returning abnormal bubbles. Monitor serial hCG levels after evacuation.' },
      { id: 'protected-soil-season', ic: '🍂', name: 'Protected Soil Season', why: 'Teach contraception during the recommended hCG surveillance period.' },
    ],
    potions: 'No routine medication cures the mole; uterine evacuation is primary treatment. Chemotherapy, such as methotrexate or actinomycin D, is used for gestational trophoblastic neoplasia when diagnosed.',
  },
  {
    id: 'hyperemesis', n: 10, name: 'The Hyperemesis Bellflower', condition: 'Hyperemesis Gravidarum', ref: 'p22_0.jpg',
    pathology: 'Severe pregnancy-related nausea and vomiting cause inability to maintain adequate intake, dehydration, and nutritional or electrolyte disturbances.',
    signs: ['Persistent severe nausea and vomiting', 'Weight loss', 'Dehydration', 'Tachycardia or orthostatic symptoms', 'Electrolyte abnormalities'],
    tools: [
      { id: 'hydration-can', ic: '🫗', name: 'Hydration Watering Can', why: 'Slowly replenish depleted water stores. Administer prescribed IV fluids.' },
      { id: 'mineral-soil-tester', ic: '🧂', name: 'Mineral Soil Tester', why: 'Check potassium, sodium, and kidney function; replace electrolytes as prescribed.' },
      { id: 'tiny-nutrient-drops', ic: '🥄', name: 'Tiny Nutrient Drops', why: 'Reintroduce tolerated food and fluids in small amounts, advancing nutrition as tolerated.' },
      { id: 'thiamine-root-shield', ic: '🔰', name: 'Thiamine Root Shield', why: 'Administer thiamine before dextrose in patients with prolonged vomiting or significant nutritional depletion.' },
    ],
    potions: 'Doxylamine-pyridoxine, metoclopramide, promethazine, or ondansetron as clinically appropriate; IV fluids, electrolyte replacement, and thiamine.',
  },
  {
    id: 'torch', n: 11, name: 'The Torch Sprout', condition: 'TORCH Infections', ref: 'p23_0.jpg',
    pathology: 'TORCH describes congenital infection risks, traditionally including toxoplasmosis, other infections, rubella, cytomegalovirus, and herpes simplex.',
    signs: ['Maternal infection may be asymptomatic', 'Fever, rash, or lymphadenopathy depending on infection', 'Fetal growth restriction', 'Congenital anomalies', 'Neonatal jaundice, hearing loss, or neurologic problems depending on organism'],
    tools: [
      { id: 'spore-lens', ic: '🧫', name: 'Spore Identification Lens', why: 'Identify which organism infected the flower. Obtain organism-specific maternal and fetal testing.' },
      { id: 'greenhouse-dome', ic: '🏠', name: 'Protective Greenhouse Dome', why: 'Teach infection-prevention measures, including food hygiene, handwashing, and appropriate exposure precautions.' },
      { id: 'seedling-scanner', ic: '🖥️', name: 'Seedling Development Scanner', why: 'Arrange indicated fetal ultrasound and specialist assessment.' },
      { id: 'new-sprout-assessment', ic: '🌱', name: 'New Sprout Assessment', why: 'Coordinate newborn testing, treatment, and follow-up for possible congenital infection.' },
    ],
    potions: 'Depend on the organism. Examples include acyclovir for HSV, penicillin for syphilis, and specialized regimens such as spiramycin or pyrimethamine-sulfadiazine with leucovorin for selected toxoplasmosis cases. Rubella has no specific curative antiviral treatment.',
  },
  {
    id: 'engorgement', n: 12, name: 'The Overflowing Carton', condition: 'Breast Engorgement', ref: 'p26_0.jpg',
    pathology: 'Breast fullness and swelling caused by increased milk volume, vascular congestion, and tissue edema, especially as milk production increases postpartum.',
    signs: ['Swollen, firm, tender breasts', 'Tight or shiny skin', 'Flattened nipples', 'Difficulty with infant latch', 'Usually bilateral fullness'],
    tools: [
      { id: 'nectar-flow-spout', ic: '🍼', name: 'Nectar-Flow Spout', why: 'Help the flower release nectar regularly. Encourage frequent effective breastfeeding.' },
      { id: 'petal-softening', ic: '🤲', name: 'Petal-Softening Technique', why: 'Gently soften the area around the nipple with reverse pressure softening when edema interferes with latch.' },
      { id: 'cooling-blossom-wrap', ic: '🧊', name: 'Cooling Blossom Wrap', why: 'Apply cold compresses between feedings.' },
      { id: 'gentle-bloom-support', ic: '🎀', name: 'Gentle Bloom Support', why: 'Provide a supportive, properly fitting bra and avoid aggressive massage or excessive pumping.' },
    ],
    potions: 'Ibuprofen or acetaminophen for pain when appropriate. Antibiotics are not indicated for uncomplicated engorgement.',
  },
  {
    id: 'pregnancy-signs', n: 13, name: 'The Signs Seedling', condition: 'Pregnancy Signs', ref: 'p27_0.jpg',
    pathology: "Pregnancy is a normal physiologic process, not a disorder. The seedling's changes teach presumptive, probable, and positive signs of pregnancy.",
    signs: ['Presumptive: amenorrhea, nausea, fatigue, breast tenderness, urinary frequency, quickening', 'Probable: positive pregnancy test, Goodell sign, Chadwick sign, Hegar sign, uterine enlargement', 'Positive: fetal heartbeat detected by an examiner, fetus visualized on ultrasound, fetal movement palpated by an examiner'],
    tools: [
      { id: 'hcg-seed-test', ic: '🧾', name: 'hCG Seed Test', why: 'Detect pregnancy hormone in the soil. Perform urine or serum pregnancy testing.' },
      { id: 'life-growth-crystal', ic: '✨', name: 'Life-Growth Crystal', why: 'Confirm the developing seedling. Arrange appropriate ultrasound.' },
      { id: 'prenatal-fertilizer', ic: '💊', name: 'Prenatal Nutrient Fertilizer', why: 'Provide essential nutrients. Teach prenatal nutrition and folic acid supplementation.' },
      { id: 'growth-calendar', ic: '🗓️', name: 'Growth Calendar', why: 'Schedule prenatal appointments, screening, and routine monitoring.' },
      { id: 'garden-rules', ic: '📜', name: 'Protective Garden Rules', why: 'Teach avoidance of alcohol, tobacco, and unsafe medications.' },
    ],
    potions: 'Prenatal vitamins and folic acid, typically 400–800 mcg daily for most pregnancies; iron supplementation when indicated.',
  },
  {
    id: 'tera-towas', n: 14, name: 'TERA-TOWAS', condition: 'Teratogens', ref: 'p28_0.jpg',
    pathology: 'Teratogenic drugs are drugs that can interfere with embryonic or fetal development.',
    signs: ['T: thalidomide', 'E: epileptic medications', 'R: retinoids', 'A: ACE inhibitors, ARBs', 'T: third element (lithium)', 'O: oral contraceptives', 'W: warfarin', 'A: alcohol', 'S: sulfonamides and sulfones'],
    tools: [
      { id: 'poison-glass', ic: '🔎', name: 'Poison-Detecting Magnifying Glass', why: 'Identify harmful substances in the soil. Review medications, alcohol, substances, and environmental exposures.' },
      { id: 'root-barrier', ic: '🧱', name: 'Protective Root Barrier', why: 'Prevent further harmful exposure when possible, with clinician-guided changes to medications.' },
      { id: 'development-crystal', ic: '🔷', name: 'Development Crystal', why: 'Assess fetal anatomy and growth with indicated prenatal testing.' },
      { id: 'safe-spellbook', ic: '📖', name: 'Safe-Gardening Spellbook', why: 'Teach medication safety and refer for teratology counseling when appropriate.' },
    ],
    potions: 'No universal antidote exists. Treatment depends on the exposure; folic acid supports normal neural tube development but cannot reverse established teratogenic injury.',
  },
  {
    id: 'prolapsed-cord', n: 15, name: 'The Prolapsed Cord Vine', condition: 'Prolapsed Umbilical Cord', ref: 'p25_0.jpg',
    pathology: 'The umbilical cord descends through the cervix ahead of or alongside the presenting fetal part, which reduces oxygenated blood flow to the fetus. This can cause fetal hypoxia and life-threatening fetal bradycardia. It is an obstetric emergency requiring immediate intervention and expedited delivery.',
    signs: ['Sudden fetal bradycardia or prolonged fetal heart rate deceleration', 'Umbilical cord may be visible at the vaginal opening or palpable during vaginal examination', 'Cord compression may cause recurrent variable decelerations and fetal hypoxia', 'May occur following rupture of membranes, particularly when the presenting part is high or unengaged'],
    tools: [
      { id: 'cord-garden-bell', ic: '🔔', name: 'Ring the Emergency Garden Bell', why: 'Call for immediate obstetric assistance and activate the emergency response.' },
      { id: 'lift-flower-bulb', ic: '🖐️', name: 'Lift the Heavy Flower Bulb', why: 'With a sterile-gloved hand, elevate the presenting fetal part off the cord and maintain pressure relief until delivery or directed handoff.' },
      { id: 'tilt-flowerpot', ic: '🪴', name: 'Tilt the Magical Flowerpot', why: 'Position the patient in knee-chest or steep Trendelenburg position to help relieve cord compression, while maintaining manual elevation.' },
      { id: 'protect-exposed-vine', ic: '🌿', name: 'Protect the Exposed Vine', why: 'If the cord protrudes externally, protect it with sterile gauze moistened with warm normal saline. Do not push the cord back inside or manipulate it unnecessarily.' },
      { id: 'blossom-heartbeat', ic: '💗', name: "Watch the Blossom's Heartbeat", why: 'Continuously monitor fetal heart rate and assess for persistent bradycardia or decelerations.' },
      { id: 'stop-growth-potion', ic: '⛔', name: 'Stop the Growth Potion', why: 'Discontinue oxytocin infusion if running, to reduce uterine stimulation.' },
      { id: 'emergency-blooming-chamber', ic: '🏥', name: 'Prepare the Emergency Blooming Chamber', why: 'Prepare for expedited delivery, usually emergency cesarean birth unless vaginal delivery is imminent and faster.' },
    ],
    potions: 'Medications do not correct the prolapsed cord itself; they support while the team prepares for delivery. Terbutaline may be ordered as a temporary tocolytic to reduce contractions and cord compression. IV crystalloid fluids maintain IV access and support circulation.',
  },
];

export const byId = (id) => CATALOG.find((p) => p.id === id);

/** The cards for one plant: its own, plus `decoys` drawn from the others. */
export function deck(id, decoys = 2, seed = 7) {
  const p = byId(id);
  let s = seed;
  const R = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const others = CATALOG.filter((o) => o.id !== id).flatMap((o) => o.tools.map((t) => ({ ...t, ok: false, from: o })));
  const picks = [];
  while (picks.length < decoys && others.length) picks.push(others.splice(Math.floor(R() * others.length), 1)[0]);
  const cards = [...p.tools.map((t) => ({ ...t, ok: true })), ...picks.map((t) => ({ ...t, why: `That one is for ${t.from.condition}: ${t.why}` }))];
  for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
  return cards;
}
