const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

exports.getDoctors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.all !== 'true') {
    filter.isActive = true;
  }
  const doctors = await Doctor.find(filter).sort({ order: 1 });
  return success(res, doctors);
});

const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

exports.getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return error(res, 'Doctor not found', 404);
  return success(res, doctor);
});

exports.getDoctorBySlug = asyncHandler(async (req, res) => {
  const param = req.params.slug;
  if (!param) return error(res, 'Doctor slug or ID required', 400);

  // 1. If param is a UUID, perform indexed direct primary key lookup
  if (isUUID(param)) {
    const doctor = await Doctor.findById(param);
    if (doctor) return success(res, doctor);
  }

  // 2. Direct indexed slug query
  let doctor = await Doctor.findOne({ slug: param });

  // 3. Normalized prefix lookup (e.g. 'dr-thiagarajan-saminadane' vs 'thiagarajan-saminadane')
  if (!doctor) {
    const altSlug = param.startsWith('dr-') ? param.slice(3) : `dr-${param}`;
    doctor = await Doctor.findOne({ slug: altSlug });
  }

  if (!doctor) return error(res, 'Doctor not found', 404);
  return success(res, doctor);
});

exports.createDoctor = asyncHandler(async (req, res) => {
  const doctorData = { ...req.body };
  if (!doctorData.slug && doctorData.name) {
    const baseSlug = doctorData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let uniqueSlug = baseSlug || 'dr';
    let counter = 1;
    while (await Doctor.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }
    doctorData.slug = uniqueSlug;
  }
  const doctor = await Doctor.create(doctorData);
  return success(res, doctor, 'Doctor created successfully', 201);
});

exports.updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doctor) return error(res, 'Doctor not found', 404);
  return success(res, doctor, 'Doctor updated successfully');
});

exports.deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) return error(res, 'Doctor not found', 404);
  return success(res, null, 'Doctor deleted successfully');
});
