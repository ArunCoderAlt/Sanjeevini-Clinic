import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Container from '../common/Container';
import api from '../../services/api';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Subscribed successfully! Thank you.');
      setEmail('');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Subscription failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-sage">
      <Container>
        <div className="bg-white rounded-3xl p-8 md:p-16 shadow-sm max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-serif text-primary-700 mb-4">Subscribe to our Wellness Newsletter</h2>
            <p className="text-gray-600">Get health tips, herbal remedies, and clinic updates directly to your inbox.</p>
          </div>

          <div className="md:w-1/2 w-full">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                disabled={loading}
                className="w-full bg-cream rounded-full py-4 pl-6 pr-16 focus:outline-none focus:ring-2 focus:ring-primary-600 text-gray-700 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-primary-700 text-white rounded-full px-6 flex items-center hover:bg-primary-600 transition-colors disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Newsletter;
