import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { scrollToTop, initializeRevealEffects } from "@/lib/utils";
import {
  ArrowRight,
  Building2,
  Truck,
  Users,
  CheckCircle2,
  Badge,
  Clock,
  TrendingUp,
  Handshake,
} from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { y: -10, transition: { duration: 0.3 } },
};

const benefitVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const JoinUs = () => {
  useEffect(() => {
    scrollToTop();
    document.title = "Join Our Team - ARCEM";
    initializeRevealEffects();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div
        className="relative h-[350px] flex items-center justify-center"
        style={{
          backgroundImage:
            "url('/uploads/images/join-us/jesse-orrico-L94dWXNKwrY-unsplash.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <motion.div
          className="relative z-10 text-center px-4 py-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-white text-5xl md:text-6xl font-montserrat font-bold mb-6">
            Join Our Team
          </h1>
          <p className="text-white text-xl md:text-2xl font-light max-w-3xl mx-auto mb-8">
            We're committed to building relationships as sturdy as our
            constructions.
          </p>
          <Link href="/subcontractors">
            <Button
              size="lg"
              className="bg-[#1E90DB] hover:bg-[#1670B0] text-lg"
            >
              Let's Build Together <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Intro Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6 text-gray-800">
                Build Your Future With ARCEM
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                At ARCEM, we believe that our people are our greatest asset.
                Whether you're a skilled tradesperson, a vendor with quality
                materials, or a professional looking for career growth, we
                invite you to join our network of excellence.
              </p>
              <p className="text-gray-600 text-lg mb-6">
                Our collaborative approach to construction has helped us build
                landmark projects across the region while fostering long-term
                relationships with our partners, subcontractors, and team
                members.
              </p>
              <Link href="/join-together">
                <div className="flex gap-3 items-center text-[#1E90DB] font-semibold cursor-pointer hover:underline">
                  <span>Discover how we can grow together</span>
                  <ArrowRight className="h-5 w-5 animate-bounce-x" />
                </div>
              </Link>
            </motion.div>
            <motion.div className="grid grid-cols-2 gap-4" variants={fadeIn}>
              <motion.div
                className="aspect-square rounded-lg overflow-hidden shadow-lg"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/uploads/images/join-us/greyson-joralemon-A1g0oeX29ec-unsplash.jpg"
                  alt="Subcontractor working with power tool"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                className="aspect-square rounded-lg overflow-hidden shadow-lg mt-6"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/uploads/images/join-us/royal-techno-india-0O-0xbvtWyw-unsplash.jpg"
                  alt="Construction equipment and machinery"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                className="aspect-square rounded-lg overflow-hidden shadow-lg"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/uploads/images/join-us/daniel-mccullough--FPFq_trr2Y-unsplash.jpg"
                  alt="Architect working on plans"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                className="aspect-square rounded-lg overflow-hidden shadow-lg mt-6"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/uploads/images/join-us/sol-tZw3fcjUIpM-unsplash.jpg"
                  alt="Career Development"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4 text-gray-800">
              Why Partner With Us
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Joining the ARCEM network offers numerous advantages that help you
              grow professionally
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div
              variants={benefitVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Handshake className="text-[#1E90DB] h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Long-term Partnerships</h3>
              <p className="text-gray-600">
                We focus on building lasting relationships rather than one-time
                contracts
              </p>
            </motion.div>

            <motion.div
              variants={benefitVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <TrendingUp className="text-[#1E90DB] h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Growth Opportunities</h3>
              <p className="text-gray-600">
                Access to high-profile projects and continuous professional
                development
              </p>
            </motion.div>

            <motion.div
              variants={benefitVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Clock className="text-[#1E90DB] h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Timely Payments</h3>
              <p className="text-gray-600">
                Reliable payment schedules for subcontractors and vendors
              </p>
            </motion.div>

            <motion.div
              variants={benefitVariants}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Badge className="text-[#1E90DB] h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Industry Recognition</h3>
              <p className="text-gray-600">
                Association with our reputable brand and award-winning projects
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* Subcontractors Section */}
            <motion.div
              className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100 hover:border-[#1E90DB] transition-colors"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="h-56 bg-gray-200 relative overflow-hidden">
                <img
                  src="/uploads/images/greyson-joralemon-A1g0oeX29ec-unsplash.jpg"
                  alt="Subcontractor working with power tool"
                  className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
                />
                <div className="absolute top-4 left-4 bg-[#1E90DB] text-white p-3 rounded-full shadow-md">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-24"></div>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-montserrat font-bold mb-4 text-gray-800">
                  Subcontractors
                </h2>
                <p className="text-gray-600 mb-8">
                  As a trusted partner in the industry, we understand the value
                  of strong subcontractor relationships in achieving project
                  success. We offer reliable subcontractor solutions, forging
                  collaborative partnerships with subcontractors who share our
                  commitment to excellence, quality craftsmanship, and timely
                  project delivery.
                </p>
                <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#1E90DB] h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Consistent work opportunities
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#1E90DB] h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Transparent communication
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#1E90DB] h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-700">Fair contract terms</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <Link href="/subcontractors" className="w-full">
                    <Button className="bg-[#1E90DB] hover:bg-[#1670B0] w-full">
                      REGISTER <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/resources" className="w-full">
                    <Button
                      variant="outline"
                      className="border-[#1E90DB] text-[#1E90DB] hover:bg-[#1E90DB] hover:text-white w-full"
                    >
                      RESOURCES <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Vendors Section */}
            <motion.div
              className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100 hover:border-[#1E90DB] transition-colors"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="h-56 bg-gray-200 relative overflow-hidden">
                <img
                  src="/uploads/images/join-us/royal-techno-india-0O-0xbvtWyw-unsplash.jpg"
                  alt="Construction equipment and machinery"
                  className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
                />
                <div className="absolute top-4 left-4 bg-[#1E90DB] text-white p-3 rounded-full shadow-md">
                  <Truck className="h-6 w-6" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-24"></div>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-montserrat font-bold mb-4 text-gray-800">
                  Vendors
                </h2>
                <p className="text-gray-600 mb-8">
                  ARCEM works with a variety of vendors to source the materials
                  and equipment we need to complete our projects. We value our
                  relationships with our vendors and are always looking for
                  reliable and professional suppliers to work with us. If you
                  are a vendor interested in working with ARCEM, please visit
                  our Vendors page to learn more about our vendor requirements
                  and how to become a preferred vendor.
                </p>
                <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#1E90DB] h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-700">
                      High-volume material needs
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#1E90DB] h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Long-term supply agreements
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#1E90DB] h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Prompt payment schedules
                    </span>
                  </div>
                </div>
                <Link href="/subcontractors?tab=vendor" className="w-full">
                  <Button className="bg-[#1E90DB] hover:bg-[#1670B0] w-full">
                    APPLY NOW <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Careers Section */}
            <motion.div
              className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100 hover:border-[#1E90DB] transition-colors"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="h-56 bg-gray-200 relative overflow-hidden">
                <img
                  src="/uploads/images/join-us/sol-tZw3fcjUIpM-unsplash.jpg"
                  alt="Construction workers climbing ladder"
                  className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
                />
                <div className="absolute top-4 left-4 bg-[#1E90DB] text-white p-3 rounded-full shadow-md">
                  <Users className="h-6 w-6" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-24"></div>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-montserrat font-bold mb-4 text-gray-800">
                  Careers
                </h2>
                <p className="text-gray-600 mb-8">
                  At ARCEM, we are always looking for talented and passionate
                  individuals to join our team. We offer a dynamic and
                  challenging work environment, competitive compensation
                  packages, and opportunities for growth and development. If you
                  are interested in a career in construction and want to work
                  with a company that values its employees and supports their
                  success, we invite you to explore our career opportunities.
                </p>
                <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#1E90DB] h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Professional development
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#1E90DB] h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-700">Competitive benefits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#1E90DB] h-5 w-5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Career advancement paths
                    </span>
                  </div>
                </div>
                <Link href="/careers" className="w-full">
                  <Button className="bg-[#1E90DB] hover:bg-[#1670B0] w-full">
                    APPLY NOW <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-gray-100 py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-12 text-gray-800">
              What Our Partners Say
            </h2>
            <div className="bg-white p-8 md:p-10 rounded-lg shadow-lg relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#1E90DB] text-white text-2xl h-12 w-12 rounded-full flex items-center justify-center">
                "
              </div>
              <p className="text-gray-600 text-lg md:text-xl italic mb-6">
                Working with ARCEM has been a game-changer for our business.
                Their professional approach, clear communication, and respect
                for our expertise have made them our preferred construction
                partner. Payment is always on time, and their project management
                is exceptional.
              </p>
              <div className="flex items-center justify-center">
                <div>
                  <p className="font-bold text-gray-800">John Martinez</p>
                  <p className="text-gray-500">
                    Elite Electrical Services, Subcontractor
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#1E90DB] py-20">
        <motion.div
          className="container mx-auto px-4 md:px-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-white text-3xl md:text-4xl font-montserrat font-bold mb-6">
            Ready to join the ARCEM team?
          </h2>
          <p className="text-white text-lg mb-8 max-w-3xl mx-auto">
            Whether you're a subcontractor, vendor, or looking for a new career
            opportunity, we would love to hear from you. Join us in building the
            future.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-white text-[#1E90DB] hover:bg-gray-100"
            >
              REACH US TODAY
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinUs;
