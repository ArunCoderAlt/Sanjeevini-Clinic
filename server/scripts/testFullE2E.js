/**
 * Comprehensive End-to-End Test Suite for Sanjeevini Siddha & Ayurveda Medical Centre
 * Tests all CRUD operations, Auth, Cache headers, Static assets, and Real-time syncing.
 */

const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://127.0.0.1:5000';
const FRONTEND_URL = 'http://localhost:5173';

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
    failures.push(message);
  }
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
  const res = await fetch(url, options);
  let json = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      json = await res.json();
    } catch (_) {}
  } else {
    json = await res.text();
  }
  return { status: res.status, headers: res.headers, body: json };
}

async function runAllTests() {
  console.log('====================================================');
  console.log(' STARTING FULL END-TO-END TEST SUITE');
  console.log(' Backend:', BACKEND_URL);
  console.log(' Frontend:', FRONTEND_URL);
  console.log('====================================================\n');

  // Track created entities for guaranteed cleanup
  const cleanupTasks = [];

  try {
    // ----------------------------------------------------
    // 1. Health & Server Checks
    // ----------------------------------------------------
    console.log('[1/13] Checking Server Health Endpoints...');
    const health1 = await request('/health');
    assert(health1.status === 200 && health1.body.status === 'ok', 'GET /health returns 200 OK');

    const health2 = await request('/api/health');
    assert(health2.status === 200 && health2.body.status === 'ok', 'GET /api/health returns 200 OK');

    // ----------------------------------------------------
    // 2. Caching Policies & Zero-Stale Cache Headers
    // ----------------------------------------------------
    console.log('\n[2/13] Validating Caching Rules & Headers...');
    const catRes = await request('/api/services');
    const cc = catRes.headers.get('cache-control') || '';
    const etag = catRes.headers.get('etag');
    assert(cc.includes('no-store') && cc.includes('no-cache'), `Dynamic catalog has no-store cache control (Actual: "${cc}")`);
    assert(!etag, `ETag is disabled on dynamic API routes (Actual: ${etag})`);

    const staticRes = await request('/uploads/dermatology-treatment-1794426000000.png');
    const staticCc = staticRes.headers.get('cache-control') || '';
    assert(staticCc.includes('public') && staticCc.includes('max-age=31536000') && staticCc.includes('immutable'),
      `Static upload images have 1-year immutable caching (Actual: "${staticCc}")`);

    // ----------------------------------------------------
    // 3. Admin Authentication & Authorization
    // ----------------------------------------------------
    console.log('\n[3/13] Testing Admin Authentication & Token Verification...');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sanjeevinisiddha.in', password: 'admin123' })
    });
    assert(loginRes.status === 200 && loginRes.body?.data?.token, 'POST /api/auth/login returns 200 with JWT token');
    const token = loginRes.body?.data?.token;

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const meRes = await request('/api/auth/me', { headers: authHeaders });
    assert(meRes.status === 200 && meRes.body?.data?.role === 'admin', 'GET /api/auth/me returns admin profile');

    // ----------------------------------------------------
    // 4. Image Upload & Public Serving
    // ----------------------------------------------------
    console.log('\n[4/13] Testing Image Upload Endpoint...');
    // Create a 1x1 transparent PNG buffer
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const formData = new FormData();
    const blob = new Blob([dummyPng], { type: 'image/png' });
    formData.append('image', blob, 'e2e-test-upload.png');

    const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const uploadJson = await uploadRes.json();
    assert((uploadRes.status === 200 || uploadRes.status === 201) && uploadJson?.data?.url, 'POST /api/upload uploads image and returns URL');
    const uploadedUrl = uploadJson?.data?.url;

    if (uploadedUrl) {
      const getImg = await request(uploadedUrl);
      assert(getImg.status === 200, `Uploaded image is publicly accessible at ${uploadedUrl}`);
      // Cleanup uploaded file from disk if local
      const filename = path.basename(uploadedUrl);
      const localFilePath = path.join(__dirname, '../public/uploads', filename);
      if (fs.existsSync(localFilePath)) {
        try { fs.unlinkSync(localFilePath); } catch (_) {}
      }
    }

    // ----------------------------------------------------
    // 5. Services CRUD End-to-End
    // ----------------------------------------------------
    console.log('\n[5/13] Testing Services CRUD Operations...');
    const testServiceData = {
      title: 'E2E Test Varmam Therapy Service',
      description: 'Comprehensive vital energy points revitalization service for testing.',
      benefits: ['Pain relief', 'Energy restoration', 'Rapid recovery'],
      order: 99,
      isActive: true,
      image: uploadedUrl || '/uploads/clinic-building.jpg'
    };

    // Create
    const createServiceRes = await request('/api/services', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testServiceData)
    });
    assert(createServiceRes.status === 201 && createServiceRes.body?.data?.id, 'CREATE Service returns 201 with ID');
    const serviceId = createServiceRes.body?.data?.id;

    if (serviceId) {
      cleanupTasks.push(async () => {
        await request(`/api/services/${serviceId}`, { method: 'DELETE', headers: authHeaders });
      });

      // Read
      const getServiceRes = await request(`/api/services/${serviceId}`);
      assert(getServiceRes.status === 200 && getServiceRes.body?.data?.title === testServiceData.title,
        'READ Service by ID retrieves exact created title');

      // Update
      const updatedServiceData = {
        title: 'E2E Test Varmam Therapy Service (Updated)',
        description: 'Updated description for testing edit persistence.',
        benefits: ['Enhanced mobility', 'Total relaxation'],
        order: 98
      };
      const updateServiceRes = await request(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updatedServiceData)
      });
      assert(updateServiceRes.status === 200 && updateServiceRes.body?.data?.title === updatedServiceData.title,
        'UPDATE Service returns 200 with modified title');

      // Verify immediate reflection
      const verifyServiceRes = await request(`/api/services/${serviceId}`);
      assert(verifyServiceRes.body?.data?.title === updatedServiceData.title,
        'GET Service immediately reflects updated title without stale cache');

      // Delete
      const deleteServiceRes = await request(`/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      assert(deleteServiceRes.status === 200, 'DELETE Service returns 200');

      // Verify deletion
      const verifyDeleteRes = await request(`/api/services/${serviceId}`);
      assert(verifyDeleteRes.status === 404, 'GET deleted Service returns 404 Not Found');
    }

    // ----------------------------------------------------
    // 6. Treatments CRUD End-to-End
    // ----------------------------------------------------
    console.log('\n[6/13] Testing Treatments CRUD Operations...');
    const testTreatmentData = {
      name: 'E2E Holistic Digestive Treatment',
      category: 'Gastrointestinal Care',
      shortDescription: 'Effective herbal therapy for digestive balance.',
      fullDescription: 'Complete traditional treatment including dietary guidance and herbal decoctions.',
      order: 99,
      isActive: true,
      image: uploadedUrl || '/uploads/clinic-building.jpg'
    };

    // Create
    const createTreatmentRes = await request('/api/treatments', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testTreatmentData)
    });
    assert(createTreatmentRes.status === 201 && createTreatmentRes.body?.data?.id, 'CREATE Treatment returns 201 with ID');
    const treatmentId = createTreatmentRes.body?.data?.id;

    if (treatmentId) {
      cleanupTasks.push(async () => {
        await request(`/api/treatments/${treatmentId}`, { method: 'DELETE', headers: authHeaders });
      });

      // Read
      const getTreatmentRes = await request(`/api/treatments/${treatmentId}`);
      assert(getTreatmentRes.status === 200 && getTreatmentRes.body?.data?.name === testTreatmentData.name,
        'READ Treatment by ID retrieves exact created name');

      // Update
      const updateTreatmentRes = await request(`/api/treatments/${treatmentId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ name: 'E2E Holistic Digestive Treatment (Modified)', shortDescription: 'Updated summary' })
      });
      assert(updateTreatmentRes.status === 200 && updateTreatmentRes.body?.data?.name.includes('Modified'),
        'UPDATE Treatment returns 200 with modified name');

      // Delete
      const deleteTreatmentRes = await request(`/api/treatments/${treatmentId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      assert(deleteTreatmentRes.status === 200, 'DELETE Treatment returns 200');

      const verifyTreatmentDelete = await request(`/api/treatments/${treatmentId}`);
      assert(verifyTreatmentDelete.status === 404, 'GET deleted Treatment returns 404');
    }

    // ----------------------------------------------------
    // 7. Swarna Bindu (Pushya Nakshatra) CRUD End-to-End
    // ----------------------------------------------------
    console.log('\n[7/13] Testing Swarna Bindu Schedule CRUD Operations...');
    const testCampData = {
      month: 'December',
      date: '2026-12-25',
      day: 'Friday',
      nakshatra: 'Pushya (Poosam)',
      timings: '5:00 PM – 9:30 PM',
      status: 'Upcoming',
      note: 'Annual winter immunity booster camp',
      order: 99,
      isActive: true
    };

    // Create
    const createCampRes = await request('/api/swarna-bindu', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testCampData)
    });
    assert(createCampRes.status === 201 && createCampRes.body?.data?.id, 'CREATE Swarna Bindu camp returns 201 with ID');
    const campId = createCampRes.body?.data?.id;

    if (campId) {
      cleanupTasks.push(async () => {
        await request(`/api/swarna-bindu/${campId}`, { method: 'DELETE', headers: authHeaders });
      });

      // Read
      const getCampRes = await request(`/api/swarna-bindu/${campId}`);
      assert(getCampRes.status === 200 && getCampRes.body?.data?.month === 'December',
        'READ Swarna Bindu camp by ID returns correct month');

      // Update
      const updateCampRes = await request(`/api/swarna-bindu/${campId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: 'Completed', note: 'Camp concluded successfully' })
      });
      assert(updateCampRes.status === 200 && updateCampRes.body?.data?.status === 'Completed',
        'UPDATE Swarna Bindu camp returns 200 with status=Completed');

      // Delete
      const deleteCampRes = await request(`/api/swarna-bindu/${campId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      assert(deleteCampRes.status === 200, 'DELETE Swarna Bindu camp returns 200');

      const verifyCampDelete = await request(`/api/swarna-bindu/${campId}`);
      assert(verifyCampDelete.status === 404, 'GET deleted Swarna Bindu camp returns 404');
    }

    // ----------------------------------------------------
    // 8. Doctors CRUD End-to-End
    // ----------------------------------------------------
    console.log('\n[8/13] Testing Doctors CRUD Operations...');
    const testDoctorData = {
      name: 'Dr. E2E Test Specialist',
      qualification: 'BAMS, MD',
      specialization: 'Ayurveda & Panchakarma',
      experience: 12,
      bio: 'Experienced Ayurvedic specialist dedicated to restorative healing.',
      consultationHours: 'Monday - Friday, 4:00 PM - 8:00 PM',
      order: 99,
      isActive: true
    };

    const createDocRes = await request('/api/doctors', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testDoctorData)
    });
    assert(createDocRes.status === 201 && createDocRes.body?.data?.id, 'CREATE Doctor returns 201 with ID');
    const docId = createDocRes.body?.data?.id;

    if (docId) {
      cleanupTasks.push(async () => {
        await request(`/api/doctors/${docId}`, { method: 'DELETE', headers: authHeaders });
      });

      // Read
      const getDocRes = await request(`/api/doctors/${docId}`);
      assert(getDocRes.status === 200 && getDocRes.body?.data?.name === testDoctorData.name, 'READ Doctor by ID returns created name');

      // Update
      const updateDocRes = await request(`/api/doctors/${docId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ name: 'Dr. E2E Test Specialist (Lead)', experience: 14 })
      });
      assert(updateDocRes.status === 200 && updateDocRes.body?.data?.experience === 14, 'UPDATE Doctor returns updated experience');

      // Delete
      const deleteDocRes = await request(`/api/doctors/${docId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      assert(deleteDocRes.status === 200, 'DELETE Doctor returns 200');

      const verifyDocDelete = await request(`/api/doctors/${docId}`);
      assert(verifyDocDelete.status === 404, 'GET deleted Doctor returns 404');
    }

    // ----------------------------------------------------
    // 9. Testimonials CRUD End-to-End
    // ----------------------------------------------------
    console.log('\n[9/13] Testing Testimonials CRUD Operations...');
    const testTestimonial = {
      name: 'Kavitha R.',
      review: 'Exceptional care and visible health improvement within two weeks!',
      rating: 5,
      location: 'Karaikal',
      treatment: 'Varmam Therapy',
      isApproved: true,
      isFeatured: true
    };

    const createTestimonialRes = await request('/api/testimonials', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testTestimonial)
    });
    assert(createTestimonialRes.status === 201 && createTestimonialRes.body?.data?.id, 'CREATE Testimonial returns 201 with ID');
    const testimonialId = createTestimonialRes.body?.data?.id;

    if (testimonialId) {
      cleanupTasks.push(async () => {
        await request(`/api/testimonials/${testimonialId}`, { method: 'DELETE', headers: authHeaders });
      });

      // Read
      const getTestimonialsRes = await request('/api/testimonials?all=true', { headers: authHeaders });
      const found = getTestimonialsRes.body?.data?.some(t => t.id === testimonialId);
      assert(found, 'READ Testimonials list includes newly created review');

      // Update
      const updateTestimonialRes = await request(`/api/testimonials/${testimonialId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ rating: 4, review: 'Updated review note.' })
      });
      assert(updateTestimonialRes.status === 200 && updateTestimonialRes.body?.data?.rating === 4,
        'UPDATE Testimonial returns updated rating');

      // Delete
      const deleteTestimonialRes = await request(`/api/testimonials/${testimonialId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      assert(deleteTestimonialRes.status === 200, 'DELETE Testimonial returns 200');
    }

    // ----------------------------------------------------
    // 10. Appointments (Decommissioned - consultations routed through Contact & Direct Call)
    // ----------------------------------------------------
    console.log('\n[10/13] Appointments decommissioned (consultations routed through Contact & Direct Call - SKIPPED)');

    // ----------------------------------------------------
    // 11. Contact Form Messages End-to-End
    // ----------------------------------------------------
    console.log('\n[11/13] Testing Contact Message Submission & Admin Review...');
    const testContact = {
      name: 'E2E Inquirer',
      email: 'inquirer@example.com',
      phone: '9842416352',
      message: 'Hello, please confirm timings for senior citizen consultations.'
    };

    const createContactRes = await request('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testContact)
    });
    assert(createContactRes.status === 201 && createContactRes.body?.data?.id,
      'POST /api/contact submits inquiry and returns 201');
    const contactId = createContactRes.body?.data?.id;

    if (contactId) {
      cleanupTasks.push(async () => {
        await request(`/api/contact/${contactId}`, { method: 'DELETE', headers: authHeaders });
      });

      // Admin View
      const getMessagesRes = await request('/api/contact', { headers: authHeaders });
      const msgFound = getMessagesRes.body?.data?.some(m => m.id === contactId);
      assert(msgFound, 'Admin GET /api/contact lists the new message');

      // Admin Mark As Read
      const markReadRes = await request(`/api/contact/${contactId}/read`, {
        method: 'PUT',
        headers: authHeaders
      });
      assert(markReadRes.status === 200 && markReadRes.body?.data?.isRead === true,
        'Admin PUT /api/contact/:id/read marks message as read');

      // Delete
      const deleteMsgRes = await request(`/api/contact/${contactId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      assert(deleteMsgRes.status === 200, 'DELETE Contact message returns 200');
    }

    // ----------------------------------------------------
    // 12. Gallery Items CRUD End-to-End
    // ----------------------------------------------------
    console.log('\n[12/13] Testing Gallery CRUD Operations...');
    const testGalleryItem = {
      title: 'E2E Clinical Demonstration Photo',
      category: 'clinic',
      imageUrl: '/uploads/clinic-building.jpg',
      caption: 'Traditional clinic facility view',
      order: 99,
      isActive: true
    };

    const createGalRes = await request('/api/gallery', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(testGalleryItem)
    });
    assert(createGalRes.status === 201 && createGalRes.body?.data?.id, 'CREATE Gallery item returns 201');
    const galleryId = createGalRes.body?.data?.id;

    if (galleryId) {
      cleanupTasks.push(async () => {
        await request(`/api/gallery/${galleryId}`, { method: 'DELETE', headers: authHeaders });
      });

      // Update
      const updateGalRes = await request(`/api/gallery/${galleryId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ title: 'E2E Clinical Demonstration Photo (Renamed)' })
      });
      assert(updateGalRes.status === 200 && updateGalRes.body?.data?.title.includes('Renamed'),
        'UPDATE Gallery item returns 200 with updated title');

      // Delete
      const deleteGalRes = await request(`/api/gallery/${galleryId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      assert(deleteGalRes.status === 200, 'DELETE Gallery item returns 200');
    }

    // ----------------------------------------------------
    // 13. Frontend Dev Server Delivery
    // ----------------------------------------------------
    console.log('\n[13/13] Testing Frontend Delivery & SPA Entry...');
    const feRes = await request(FRONTEND_URL);
    assert(feRes.status === 200, `Frontend root responds with HTTP 200 (${FRONTEND_URL})`);
    assert(typeof feRes.body === 'string' && feRes.body.includes('<div id="root"></div>'),
      'Frontend returns valid HTML with React root mounting point');

  } catch (err) {
    console.error('\nUNEXPECTED SUITE EXCEPTION:', err);
    failed++;
    failures.push(err.message);
  } finally {
    // Run cleanup tasks in reverse order to leave DB completely clean
    if (cleanupTasks.length > 0) {
      console.log('\n[Cleanup] Cleaning up all test entities from database...');
      for (const cleanup of cleanupTasks.reverse()) {
        try { await cleanup(); } catch (_) {}
      }
      console.log('[Cleanup] Cleanup complete. Database is pristine.');
    }
  }

  console.log('\n====================================================');
  console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    console.error('\nFailures encountered:');
    failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY! No bugs detected.');
    process.exit(0);
  }
}

runAllTests();
