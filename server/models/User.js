const bcrypt = require('bcryptjs');
const { createSupabaseModel } = require('../utils/supabaseModel');

const User = createSupabaseModel('users', {
  beforeSave: async (userData) => {
    if (userData.password && !userData.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    return userData;
  },
  methods: {
    async matchPassword(enteredPassword) {
      if (!this.password) return false;
      return await bcrypt.compare(enteredPassword, this.password);
    },
  },
});

module.exports = User;
