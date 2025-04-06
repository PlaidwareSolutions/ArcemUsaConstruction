import { useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { scrollToTop, initializeRevealEffects } from '@/lib/utils';
import { ArrowRight, Building2, Truck, Users, Star, Award, TrendingUp, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const JoinTogether = () => {
  useEffect(() => {
    scrollToTop();
    document.title = 'Grow With Us - ARCEM';
    initializeRevealEffects(true);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <PageHeader
        title="Passion Led Us Here"
        subtitle="Join a team driven by passion and purpose. We're building more than structures - we're building a future together."
        backgroundImage="/uploads/images/ian-schneider-TamMbr4okv4-unsplash.jpg"
      >
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="#opportunities" onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}>
            <Button size="lg" className="bg-[#1E90DB] hover:bg-[#1670B0] text-lg">
              Explore Opportunities <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Vision Statement */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6 text-gray-800">
              Our Vision for Growth
            </h2>
            <p className="text-gray-600 text-lg mb-12 leading-relaxed">
              At ARCEM, we believe that true success comes from collaborative partnerships. We are committed to creating an ecosystem where subcontractors, vendors, and employees can thrive alongside our company's growth. By fostering relationships built on trust, transparency, and mutual respect, we aim to deliver exceptional value to our clients while providing sustainable opportunities for our partners.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div 
              className="flex flex-col items-center text-center"
              variants={fadeInUp}
            >
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Star className="h-10 w-10 text-[#1E90DB]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Excellence</h3>
              <p className="text-gray-600">
                We pursue excellence in every project, creating opportunities for partners who share our commitment to quality.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center text-center"
              variants={fadeInUp}
            >
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Award className="h-10 w-10 text-[#1E90DB]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Integrity</h3>
              <p className="text-gray-600">
                We conduct business with integrity and transparency, building trust with our clients and partners.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center text-center"
              variants={fadeInUp}
            >
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <TrendingUp className="h-10 w-10 text-[#1E90DB]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Growth</h3>
              <p className="text-gray-600">
                We foster growth for our team members, subcontractors, and vendors through long-term partnerships.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Image Banner */}
      <div className="h-[400px] overflow-hidden relative bg-fixed" style={{ backgroundImage: "url('/uploads/images/silvia-brazzoduro-YSxcf6C_SEg-unsplash.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Building More Than Structures</h2>
            <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto">
              We're building relationships, careers, and opportunities for growth
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Opportunities Section */}
      <div id="opportunities" className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="text-center max-w-4xl mx-auto mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6 text-gray-800">
              Join Us Today
            </h2>
            <p className="text-gray-600 text-lg">
              Discover the perfect pathway to partnership with ARCEM based on your expertise and business model
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* Subcontractor Card */}
            <motion.div 
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:border-[#1E90DB] transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2"
              variants={fadeInLeft}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src="/uploads/images/greyson-joralemon-A1g0oeX29ec-unsplash.jpg" 
                  alt="Subcontractor working with power tool" 
                  className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
                />
              </div>
              <div className="relative mt-[-40px] mx-4">
                <div className="bg-[#1E90DB] text-white h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Building2 className="h-8 w-8" />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold mb-4">Subcontractors</h3>
                <p className="text-gray-600 mb-6">
                  Join our network of skilled subcontractors and gain access to consistent project opportunities, fair payment terms, and a collaborative work environment.
                </p>
                <Link href="/subcontractors" className="block">
                  <Button className="bg-[#1E90DB] hover:bg-[#1670B0] w-full">
                    Register as Subcontractor <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Vendor Card */}
            <motion.div 
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:border-[#1E90DB] transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src="/uploads/images/royal-techno-india-0O-0xbvtWyw-unsplash.jpg" 
                  alt="Construction equipment and machinery" 
                  className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
                />
              </div>
              <div className="relative mt-[-40px] mx-4">
                <div className="bg-[#1E90DB] text-white h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Truck className="h-8 w-8" />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold mb-4">Vendors</h3>
                <p className="text-gray-600 mb-6">
                  Become a trusted supplier for our growing portfolio of projects. We seek quality materials, reliable delivery, and competitive pricing from our vendor partners.
                </p>
                <Link href="/subcontractors?tab=vendor" className="block">
                  <Button className="bg-[#1E90DB] hover:bg-[#1670B0] w-full">
                    Register as Vendor <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Careers Card */}
            <motion.div 
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:border-[#1E90DB] transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2"
              variants={fadeInRight}
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src="/uploads/images/sol-tZw3fcjUIpM-unsplash.jpg" 
                  alt="Construction workers climbing ladder" 
                  className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
                />
              </div>
              <div className="relative mt-[-40px] mx-4">
                <div className="bg-[#1E90DB] text-white h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold mb-4">Join Our Team</h3>
                <p className="text-gray-600 mb-6">
                  Launch or advance your career with a company that values innovation, offers competitive benefits, and provides clear paths for professional growth.
                </p>
                <Link href="/careers" className="block">
                  <Button className="bg-[#1E90DB] hover:bg-[#1670B0] w-full">
                    Explore Careers <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="bg-[#1E90DB] rounded-xl p-10 text-center text-white max-w-5xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Build Your Future With Us?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Whether you're looking to partner as a subcontractor, vendor, or join our team, we're excited to explore how we can grow together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-[#1E90DB]">
                  Contact Us Today
                </Button>
              </Link>
              <Link href="/resources">
                <Button size="lg" className="bg-white text-[#1E90DB] hover:bg-gray-100">
                  Access Resources
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Company Stats */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="p-6">
              <div className="text-[#1E90DB] text-4xl font-bold mb-2">100+</div>
              <div className="text-gray-600">Completed Projects</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-6">
              <div className="text-[#1E90DB] text-4xl font-bold mb-2">75+</div>
              <div className="text-gray-600">Subcontractor Partners</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-6">
              <div className="text-[#1E90DB] text-4xl font-bold mb-2">30+</div>
              <div className="text-gray-600">Vendor Relationships</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-6">
              <div className="text-[#1E90DB] text-4xl font-bold mb-2">12+</div>
              <div className="text-gray-600">Years of Excellence</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Have Questions?</h2>
            <p className="text-gray-600 mb-8">
              Our team is ready to assist you with any questions about becoming a partner or joining our team.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
              <div className="flex items-center justify-center gap-2">
                <span className="font-semibold">Cell:</span>
                <a href="tel:7136240083" className="text-[#1E90DB] hover:underline">(713) 624-0083</a>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-semibold">Office:</span>
                <a href="tel:7136240313" className="text-[#1E90DB] hover:underline">(713) 624-0313</a>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <a href="mailto:aj@arcemusa.com" className="text-[#1E90DB] hover:underline">aj@arcemusa.com</a>
              <a href="mailto:admin@arcemusa.com" className="text-[#1E90DB] hover:underline">admin@arcemusa.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinTogether;