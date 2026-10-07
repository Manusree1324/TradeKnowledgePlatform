require('dotenv').config();

const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Tutorial = require('./models/Tutorial');
const User = require('./models/User');
const slugify = require('./utils/slugify');

const categoryDefinitions = [
  ['Electrical', 'Circuit installation, testing methods, electrical maintenance, and code-aware field practice.'],
  ['Plumbing', 'Water supply, drainage, fixture service, and practical plumbing diagnostics.'],
  ['Welding', 'Weld preparation, process setup, inspection, and hot-work safety.'],
  ['HVAC', 'Air distribution, preventive maintenance, controls, and comfort-system diagnostics.'],
  ['Carpentry', 'Layout, framing, fastening, finish work, and shop practice.'],
  ['Automotive', 'Vehicle inspection, routine service, diagnostics, and workshop practice.'],
  ['Masonry', 'Block, brick, mortar, concrete, and site preparation techniques.']
];

const tutorialDefinitions = [
  {
    category: 'Electrical', title: 'Verify a receptacle circuit is de-energized before service',
    description: 'A careful isolation and verification sequence for qualified workers preparing to inspect a receptacle circuit.',
    content: 'This guide covers the planning and verification steps before work begins on a receptacle circuit. It is not a substitute for electrical training, site procedures, or the locally adopted electrical code. If the circuit cannot be positively identified or isolated, stop and involve a qualified electrician.',
    steps: [
      { title: 'Identify the circuit and work boundary', description: 'Review drawings and panel schedules, then use an approved circuit tracer or controlled test to identify the correct branch circuit.' },
      { title: 'Isolate and secure the source', description: 'Open the correct disconnecting means, apply the site lockout/tagout process, and prevent another person from restoring power.' },
      { title: 'Prove the tester before use', description: 'Check an appropriately rated tester on a known live source, test all relevant conductors at the work point, then prove the tester again on the known source.' }
    ],
    safetyPrecautions: ['Only a qualified person should perform electrical isolation and testing; never work on an energized circuit as a shortcut.', 'Use a properly rated, inspected voltage tester and PPE selected for the task and the site risk assessment.', 'If any reading, circuit label, or isolation point is uncertain, stop work and have the circuit traced by a qualified electrician.']
  },
  {
    category: 'Electrical', title: 'Document a multi-way lighting circuit before making changes',
    description: 'A method for recording switch locations, cable identifiers, and observed connections so a lighting alteration can be planned accurately.',
    content: 'Multi-way switching is easy to misidentify when conductors have been altered over time. Build a clear record before planning changes, and compare the proposed work with the applicable code and manufacturer instructions. This workflow is for trained electrical workers, not a live troubleshooting procedure.',
    steps: [
      { title: 'Record the control points', description: 'Note every switch location, luminaire, circuit identifier, and the symptoms reported by the occupant.' },
      { title: 'Isolate before opening enclosures', description: 'Identify the correct supply, lock and tag it under site procedure, and verify absence of voltage with a proven tester.' },
      { title: 'Label and sketch conductors', description: 'Photograph the as-found arrangement where permitted, label each conductor by location, and draw a simple point-to-point record before disconnecting anything.' }
    ],
    safetyPrecautions: ['Do not remove switch plates or enclosures while energized; follow the site isolation and test-before-touch procedure.', 'Do not rely on conductor color alone to identify function, especially in older or modified installations.', 'Confirm any proposed circuit alteration with the locally adopted electrical code and a qualified person.']
  },
  {
    category: 'Electrical', title: 'Use a panel schedule to plan a branch-circuit load review',
    description: 'Organize connected loads and existing circuit information before a qualified electrician reviews capacity and code requirements.',
    content: 'A panel schedule is a planning aid, not proof that a circuit has spare capacity. Gather reliable nameplate and circuit information, record assumptions, and have calculations checked against the applicable code and installation conditions before equipment is added.',
    steps: [
      { title: 'Collect reliable equipment data', description: 'Record equipment nameplate ratings, operating conditions, and manufacturer installation requirements for the proposed loads.' },
      { title: 'Reconcile the existing schedule', description: 'Compare circuit labels with verified field information and note unknown, shared, or continuous loads instead of guessing.' },
      { title: 'Prepare the review worksheet', description: 'List each load, the proposed circuit, assumptions, and applicable demand factors for review by a qualified electrician.' }
    ],
    safetyPrecautions: ['Do not remove a panel dead front or measure inside energized equipment unless qualified and following an approved energized-work assessment.', 'Never treat an empty breaker position as available electrical capacity; verify conductor, overcurrent, demand, and equipment limits.', 'Have final calculations and installation plans reviewed against the local code and authority requirements.']
  },
  {
    category: 'Plumbing', title: 'Clear a slow bathroom sink drain without mixing chemicals',
    description: 'A low-risk diagnostic sequence for checking a pop-up stopper and accessible trap when a bathroom basin drains slowly.',
    content: 'A slow basin drain is often caused by hair or soap residue at the stopper, but the cause can also be a downstream restriction. Start with accessible mechanical checks and stop if the fixture, trap, or piping is damaged. This guide does not recommend caustic drain chemicals.',
    steps: [
      { title: 'Check the basin and stopper', description: 'Remove visible debris with gloves, lift out the accessible stopper if its design allows, and clean residue from the linkage area.' },
      { title: 'Inspect the accessible trap', description: 'Place a container under the trap, confirm the piping is cool and not under pressure, and clean only serviceable connections you are trained to handle.' },
      { title: 'Flush and observe', description: 'Reassemble the trap with its seals correctly seated, run water while watching for leaks, and note whether drainage improves.' }
    ],
    safetyPrecautions: ['Never combine drain cleaners or mix chemical products; splashes and fumes can cause severe injury.', 'Wear eye protection and waterproof gloves, and treat backed-up water as potentially contaminated.', 'Stop and call a licensed plumber if the trap is corroded, connections will not seal, or multiple fixtures are draining slowly.']
  },
  {
    category: 'Plumbing', title: 'Replace a serviceable faucet cartridge after isolating the supply',
    description: 'Prepare and document a cartridge replacement on a compatible faucet after confirming the local shutoffs work.',
    content: 'Cartridge styles differ by faucet manufacturer, and incorrect parts can damage the valve body or cause a leak. Identify the faucet model, use the approved replacement part, and stop if the isolation valves do not fully shut off or the valve body is damaged.',
    steps: [
      { title: 'Identify the faucet and replacement part', description: 'Record the faucet brand and model, obtain its service instructions, and compare the replacement cartridge before disassembly.' },
      { title: 'Isolate and relieve pressure', description: 'Close both fixture shutoffs, open the faucet to confirm flow stops, and protect the basin drain from dropped hardware.' },
      { title: 'Replace and function-check', description: 'Remove the handle and retainer in the documented order, install the cartridge in its correct orientation, then restore supply slowly and inspect for leaks.' }
    ],
    safetyPrecautions: ['Do not force seized shutoff valves; a failed valve can flood the space and may require building-level isolation.', 'Keep small parts out of the drain and wear eye protection when removing retaining clips or spring-loaded components.', 'Use only the faucet manufacturer’s procedure and replacement parts; stop if the valve body or supply connection is damaged.']
  },
  {
    category: 'Plumbing', title: 'Prepare a new water-supply line for a witnessed pressure test',
    description: 'A documentation-first checklist for planning a code-compliant pressure test on newly installed water piping.',
    content: 'Pressure testing is governed by the adopted plumbing code, system material, and project specification. Establish the test medium, pressure, duration, and witness requirements from approved documents before connecting test equipment. This guide intentionally does not prescribe a universal test pressure.',
    steps: [
      { title: 'Confirm the approved test criteria', description: 'Check the project specification, local code, pipe and fitting ratings, and inspection authority requirements; record the required test method.' },
      { title: 'Inspect the test boundary', description: 'Verify supports, temporary caps, isolation points, and component ratings, and identify any equipment that must be disconnected or protected.' },
      { title: 'Record results and restore service', description: 'Use a calibrated gauge, raise pressure only as specified, document readings and witness details, then depressurize and flush as required.' }
    ],
    safetyPrecautions: ['Never apply compressed air or exceed a component rating unless the approved procedure explicitly permits it and a qualified supervisor controls the test.', 'Keep personnel clear of temporary caps, plugs, and pressurized joints; release pressure in a controlled manner.', 'Do not conceal piping until the required inspection and witnessed test are documented.']
  },
  {
    category: 'Welding', title: 'Prepare mild-steel coupons for a supervised SMAW practice weld',
    description: 'A repeatable coupon-preparation and setup routine for a supervised shielded metal arc welding practice session.',
    content: 'Good practice coupons make it easier to evaluate travel, bead consistency, and fusion without confusing preparation problems with technique. Use material and parameters approved by the instructor or qualified welding procedure, and do not infer structural suitability from a practice bead.',
    steps: [
      { title: 'Confirm material and exercise scope', description: 'Verify coupon material, thickness, joint design, electrode classification, and the applicable training exercise or qualified procedure.' },
      { title: 'Prepare clean, square edges', description: 'Remove coatings and contamination using the approved method, deburr the edges, and mark the intended joint while preserving traceability.' },
      { title: 'Set up and inspect the station', description: 'Check the machine leads, electrode holder, return connection, screens, and work area before setting parameters from the approved exercise.' }
    ],
    safetyPrecautions: ['Wear a correctly rated welding helmet, safety glasses, gloves, flame-resistant clothing, and suitable footwear.', 'Use local exhaust ventilation and confirm nearby combustible materials are removed or protected under the hot-work permit.', 'Keep the workpiece return connected correctly and never use damaged leads or holders.']
  },
  {
    category: 'Welding', title: 'Inspect a practice MIG bead for common visual discontinuities',
    description: 'A visual review method for training samples that separates observable surface issues from defects requiring qualified inspection.',
    content: 'Visual checks can identify surface concerns but cannot establish the internal soundness or service fitness of a weld. Compare the sample with the exercise acceptance criteria and refer production work to the qualified inspector and governing welding code.',
    steps: [
      { title: 'Clean the sample after it is cool', description: 'Wait for the coupon to cool in a designated area, then remove loose spatter using the permitted tools and maintain sample identification.' },
      { title: 'Review the bead systematically', description: 'Check continuity, width, toe blending, visible porosity, undercut, overlap, and crater completion under adequate lighting.' },
      { title: 'Record observations against criteria', description: 'Photograph the sample beside a scale, note the location of each observation, and compare it with the instructor’s acceptance standard.' }
    ],
    safetyPrecautions: ['Treat recently welded metal as hot even when it no longer glows; use tongs and mark the cooling area clearly.', 'Wear safety glasses and suitable gloves when removing spatter; control sparks and sharp wire ends.', 'Do not approve a production weld from a visual practice check alone; use the required qualified inspection method.']
  },
  {
    category: 'Welding', title: 'Plan local fume extraction before a stainless-steel weld exercise',
    description: 'A pre-task ventilation and work-area checklist for a supervised stainless-steel welding exercise.',
    content: 'Welding fumes can contain hazardous substances that vary with base metal, filler, surface treatment, and process. Engineering controls must be selected from the site exposure assessment; a respirator alone is not a substitute for effective ventilation and a safe work plan.',
    steps: [
      { title: 'Review the material and task assessment', description: 'Confirm the material and consumables, consult safety data sheets, and check the site exposure assessment and hot-work requirements.' },
      { title: 'Position extraction at the source', description: 'Set the approved local exhaust hood close enough to capture the plume without disturbing shielding gas or obstructing safe movement.' },
      { title: 'Verify controls and document the setup', description: 'Check airflow indicators and barriers, confirm adjacent workers are protected, and stop if extraction is unavailable or ineffective.' }
    ],
    safetyPrecautions: ['Use a qualified exposure assessment for stainless-steel and coated materials; some fume constituents can cause serious health effects.', 'Maintain required ventilation without drawing the fume plume through the welder’s breathing zone.', 'Follow the site hot-work permit, fire-watch, and respiratory-protection program; stop if the work area or extraction changes.']
  },
  {
    category: 'HVAC', title: 'Inspect and replace a return-air filter without bypass gaps',
    description: 'A maintenance routine for checking the correct filter size, airflow direction and fit on a residential air handler.',
    content: 'A filter that is too restrictive, incorrectly sized, or installed with gaps can reduce performance and allow dust bypass. Confirm the equipment manufacturer’s filter specification and maintenance interval rather than choosing a filter by appearance alone.',
    steps: [
      { title: 'Check the equipment documentation', description: 'Find the approved filter dimensions and type, confirm the service access point, and note any airflow or static-pressure requirements.' },
      { title: 'Inspect the old filter and rack', description: 'Switch the system off using the normal service control, remove the filter, record its airflow arrow, and inspect the rack for bypass gaps or damage.' },
      { title: 'Fit and verify the replacement', description: 'Install the correct filter with airflow in the marked direction, close the access panel securely, and confirm normal system operation.' }
    ],
    safetyPrecautions: ['Isolate electrical power before opening equipment panels beyond the filter access door; only qualified personnel should service internal components.', 'Do not install a higher-resistance filter than the equipment is designed to use.', 'Wear gloves and a suitable dust mask if the removed filter is heavily contaminated or the site assessment requires it.']
  },
  {
    category: 'HVAC', title: 'Trace a condensate-drain maintenance issue before water damage spreads',
    description: 'A safe inspection sequence for identifying visible condensate-drain restrictions and documenting follow-up work.',
    content: 'Condensate systems vary by equipment and installation. Follow the unit service manual and local requirements for traps, cleanouts, and auxiliary protection. Refrigerant circuits and electrical compartments are outside this maintenance check and require qualified HVAC service.',
    steps: [
      { title: 'Check the reported symptom and equipment state', description: 'Record where water was observed, inspect the accessible drain pan, and check any overflow switch indication without bypassing it.' },
      { title: 'Inspect accessible drain components', description: 'Look for visible kinks, disconnected joints, poor support, or standing water at designated cleanouts, following the manufacturer procedure.' },
      { title: 'Clear only approved service points', description: 'Use the method specified for the unit, restore the trap and cleanout caps, then run a controlled operation check and document the result.' }
    ],
    safetyPrecautions: ['Disconnect power before accessing internal components and verify safe isolation when required by the service procedure.', 'Do not bypass an overflow switch or introduce chemicals that are not approved for the equipment and drain materials.', 'Leave refrigerant-circuit work to appropriately licensed and certified HVAC technicians.']
  },
  {
    category: 'Carpentry', title: 'Lay out a square opening using a consistent reference face',
    description: 'A practical marking routine that keeps measurements consistent when laying out a framed opening on stock lumber.',
    content: 'Accurate layout begins with a known reference face and clear dimensions from the approved drawing. Check the project plan, material grade, and structural requirements before cutting. This guide covers marking practice, not structural sizing or approval.',
    steps: [
      { title: 'Select the reference face and datum', description: 'Choose the straightest reference face, mark it clearly, and transfer the opening dimensions from the current drawing.' },
      { title: 'Mark with a square and sharp pencil', description: 'Hold the square firmly against the datum edge, draw full-width lines, and mark the waste side so the cut allowance remains visible.' },
      { title: 'Cross-check the layout', description: 'Measure both diagonals and confirm the opening dimensions against the drawing before any stock is cut.' }
    ],
    safetyPrecautions: ['Check for embedded fasteners and keep hands outside the cutting path when using saws or layout knives.', 'Use stable supports and the correct eye and hearing protection for the cutting tools in use.', 'Do not alter load-bearing members or opening sizes without approved plans and the required professional review.']
  },
  {
    category: 'Carpentry', title: 'Choose pilot-hole size for a clean hardwood screw joint',
    description: 'Use a manufacturer chart and a test piece to reduce splitting when fastening near the end of hardwood stock.',
    content: 'Pilot-hole diameter depends on screw type, root diameter, wood species, moisture, and edge distance. Manufacturer guidance and a test piece are more reliable than one universal drill size. Structural connections must follow the approved connector schedule.',
    steps: [
      { title: 'Confirm fastener and material', description: 'Identify the screw specification, hardwood species, stock thickness, and whether the joint is decorative or structural.' },
      { title: 'Select and mark the pilot size', description: 'Use the fastener manufacturer’s chart, mark the centerline and required edge distance, and check that the bit is sharp and straight.' },
      { title: 'Test on matching scrap', description: 'Drill a test hole in an offcut, drive one screw at controlled speed, and inspect for splitting or poor thread engagement before production work.' }
    ],
    safetyPrecautions: ['Clamp the workpiece securely and keep the drill aligned so the bit cannot bind or break.', 'Wear eye protection and keep loose clothing, hair, and gloves clear of rotating equipment.', 'Use the specified structural fastener and approved detail for load-bearing connections; do not substitute based on appearance.']
  },
  {
    category: 'Automotive', title: 'Check tire pressure and tread condition during a cold inspection',
    description: 'A repeatable walk-around for comparing tire pressure with the vehicle placard and recording visible tread concerns.',
    content: 'Tire pressure recommendations are vehicle-specific and are usually listed on the door placard or in the owner’s manual, not on the tire sidewall. Tire damage and tread limits are safety-critical; refer uncertain findings to a qualified tire professional.',
    steps: [
      { title: 'Confirm the vehicle specification', description: 'Read the placard or manual for the correct front and rear pressures and any load-specific instructions.' },
      { title: 'Measure before driving', description: 'Use a suitable calibrated gauge when tires are cold, record each reading, and compare it with the vehicle specification.' },
      { title: 'Inspect tread and sidewalls', description: 'Look for embedded objects, bulges, cuts, uneven wear, and tread indicators; document defects and arrange qualified service where needed.' }
    ],
    safetyPrecautions: ['Park on a level surface, apply the parking brake, and avoid inspecting tires beside moving traffic without a safe work zone.', 'Never inflate beyond the vehicle specification or use a visibly damaged tire as normal service equipment.', 'Do not remove an embedded object from a tire; refer puncture assessment and repair to a qualified tire technician.']
  },
  {
    category: 'Automotive', title: 'Prepare a 12-volt battery for a basic voltage and terminal check',
    description: 'A basic service-bay checklist for documenting a 12-volt battery’s condition before advanced electrical diagnosis.',
    content: 'A resting voltage reading is only one clue and cannot by itself confirm battery capacity or charging-system condition. Vehicle procedures vary, especially on hybrid, start-stop, and high-voltage systems; consult the service information before connecting test equipment.',
    steps: [
      { title: 'Identify the vehicle and battery system', description: 'Check the service information for battery location, chemistry, test points, and any required memory or isolation procedure.' },
      { title: 'Inspect the case and terminals', description: 'Look for swelling, cracks, leakage, loose connections, or corrosion; do not proceed with a damaged or leaking battery.' },
      { title: 'Measure using the approved method', description: 'Set a suitable digital multimeter to DC voltage, connect to designated terminals with correct polarity, and record the reading alongside temperature and battery state.' }
    ],
    safetyPrecautions: ['Keep flames, sparks, metal jewelry, and smoking materials away from batteries; wear eye protection and acid-resistant gloves.', 'Do not short battery terminals with tools or reverse test leads; batteries can deliver extremely high fault current.', 'Hybrid and high-voltage vehicle components must only be serviced by technicians trained and authorized for that system.']
  }
];

async function seed() {
  await connectDB();
  const categories = new Map();
  for (const [name, description] of categoryDefinitions) {
    const slug = slugify(name);
    const category = await Category.findOneAndUpdate(
      { slug }, { $set: { name, description }, $setOnInsert: { slug } },
      { upsert: true, new: true, runValidators: true }
    );
    categories.set(name, category);
  }

  const authorEmail = (process.env.SEED_AUTHOR_EMAIL || 'field.author@tradeknowledge.local').toLowerCase();
  let author = await User.findOne({ email: authorEmail });
  if (!author) {
    author = await User.create({
      name: 'TradeKnowledge Field Contributor',
      email: authorEmail,
      password: crypto.randomBytes(32).toString('hex'),
      role: 'professional',
      tradeSpecialization: 'Multi-trade field practice',
      experienceLevel: 'advanced',
      bio: 'A contributor account for curated, safety-first trade learning guides.'
    });
  }

  for (const definition of tutorialDefinitions) {
    const { category: categoryName, ...tutorial } = definition;
    await Tutorial.findOneAndUpdate(
      { title: tutorial.title },
      { $set: { ...tutorial, category: categories.get(categoryName)._id, author: author._id, status: 'published' } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    if (process.env.SEED_ADMIN_PASSWORD.length < 10) throw new Error('SEED_ADMIN_PASSWORD must be at least 10 characters.');
    const email = process.env.SEED_ADMIN_EMAIL.toLowerCase();
    const existingAdmin = await User.findOne({ email });
    const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12);
    await User.findOneAndUpdate(
      { email },
      { $set: { role: 'admin', name: existingAdmin?.name || 'Platform Administrator', password }, $setOnInsert: { email } },
      { upsert: true, new: true, runValidators: true }
    );
  }

  console.log(`Seeded ${tutorialDefinitions.length} tutorials across ${categoryDefinitions.length} trade categories.`);
  await require('mongoose').disconnect();
}

if (require.main === module) {
  seed().catch(async (error) => {
    console.error(`[Seed Error] ${error.message}`);
    await require('mongoose').disconnect().catch(() => {});
    process.exitCode = 1;
  });
}

module.exports = { categoryDefinitions, tutorialDefinitions, seed };