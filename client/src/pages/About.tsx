import { useEffect } from 'react';
import { initializeRevealEffects, scrollToTop } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Loader2 } from 'lucide-react';
import { TeamMember } from '@shared/schema';
import { useAuth } from '@/contexts/AuthContext';

const About = () => {
  // Explicitly use useAuth at the top of the component to maintain hook order
  const { isAdmin } = useAuth();
  const { activeTeamMembers: teamMembers, isLoadingActive: isLoadingTeamMembers } = useTeamMembers();
  
  useEffect(() => {
    scrollToTop();
    document.title = 'About Us - ARCEM';
    const cleanup = initializeRevealEffects(true);
    return cleanup;
  }, []);

  return (
    <>
      {/* Page Banner */}
      <div 
        className="relative h-[350px] flex items-center justify-center" 
        style={{
          backgroundImage: "url('/uploads/images/about/Luxury-Residential-Community.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-75"></div>
        <motion.div 
          className="container relative z-10 px-4 md:px-8 text-white py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">About ARCEM</h1>
          <p className="text-lg max-w-3xl">
            We've been building excellence and crafting futures for over three decades.
          </p>
        </motion.div>
      </div>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <h2 className="text-sm font-montserrat text-[#1E90DB] tracking-wider uppercase">Our Story</h2>
            <h3 className="text-3xl md:text-4xl font-montserrat font-bold mt-3 mb-6">The Story of A+R C.E.M LLC</h3>
            <p className="text-lg text-gray-700 italic">Building a Legacy of Excellence</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="reveal">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Construction team discussing plans" 
                  className="w-full h-auto object-cover rounded-md shadow-xl"
                />
                <div className="absolute -bottom-5 -right-5 bg-[#1E90DB] text-white p-4 rounded shadow-lg">
                  <p className="font-montserrat font-bold text-xl">100+</p>
                  <p className="text-sm">Completed Projects</p>
                </div>
              </div>
            </div>
            
            <div className="reveal">
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                In the ever-evolving world of construction and engineering, A+R C.E.M LLC stands as a beacon of innovation, reliability, and excellence. Founded on the principles of integrity, quality, and visionary leadership, our company has been shaping communities with unparalleled dedication.
              </p>
              
              <div className="border-l-4 border-[#1E90DB] pl-6 mb-8">
                <h4 className="text-xl font-montserrat font-bold mb-3">Our Journey</h4>
                <p className="text-gray-700 leading-relaxed">
                  A+R C.E.M LLC was established with a singular mission: to revolutionize the construction and engineering management industry through cutting-edge pre-construction, design-build solutions, meticulous project management, and exceptional tenant improvement services.
                </p>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                From humble beginnings, we have grown into a trusted name in mid-level construction, delivering projects that exceed expectations and set new benchmarks for quality and efficiency.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-md shadow-sm mb-8">
                <p className="text-gray-700 leading-relaxed">
                  With <span className="font-bold text-[#1E90DB]">100 completed projects</span> and <span className="font-bold text-[#1E90DB]">100 satisfied clients</span>, we have built a reputation for excellence. Our presence extends across the United States with two office locations—one in <span className="font-semibold">Hawaii</span> and another in <span className="font-semibold">Houston</span>—allowing us to serve a diverse range of clients efficiently.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="reveal order-2 lg:order-1">
              <div className="border-l-4 border-[#1E90DB] pl-6 mb-8">
                <h4 className="text-xl font-montserrat font-bold mb-3">Our Values</h4>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  At A+R C.E.M LLC, we believe in more than just building structures—we build relationships and trust. Our values define our approach:
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-5 rounded-md shadow-sm">
                  <h5 className="font-montserrat font-bold text-[#1E90DB] mb-2">Integrity</h5>
                  <p className="text-gray-700">We operate with transparency and honesty in all our dealings.</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-md shadow-sm">
                  <h5 className="font-montserrat font-bold text-[#1E90DB] mb-2">Excellence</h5>
                  <p className="text-gray-700">We are committed to delivering superior craftsmanship and innovative solutions.</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-md shadow-sm">
                  <h5 className="font-montserrat font-bold text-[#1E90DB] mb-2">Collaboration</h5>
                  <p className="text-gray-700">We work closely with clients, partners, and stakeholders to achieve shared success.</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-md shadow-sm">
                  <h5 className="font-montserrat font-bold text-[#1E90DB] mb-2">Sustainability</h5>
                  <p className="text-gray-700">We prioritize eco-friendly and sustainable building practices to protect our future.</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="text-xl font-montserrat font-bold mb-3 border-l-4 border-[#1E90DB] pl-6">Looking Ahead</h4>
                <p className="text-gray-700 leading-relaxed">
                  As we continue to grow and expand, our vision remains steadfast: to lead the industry with forward-thinking solutions, unparalleled service, and a commitment to excellence. Whether it's improving commercial properties or enhancing living spaces, A+R C.E.M LLC is dedicated to turning visions into reality.
                </p>
              </div>
              
              <div className="bg-[#1E90DB] text-white p-6 rounded-md shadow-md">
                <h4 className="text-xl font-montserrat font-bold mb-3">Your Partner in Construction</h4>
                <p className="leading-relaxed">
                  When you choose A+R C.E.M LLC, you're choosing a partner who values your vision as much as you do. Let's build something remarkable together.
                </p>
              </div>
            </div>
            
            <div className="reveal order-1 lg:order-2">
              <div className="border-l-4 border-[#1E90DB] pl-6 mb-8">
                <h4 className="text-xl font-montserrat font-bold mb-3">What We Do</h4>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  We specialize in comprehensive construction and engineering services designed to meet diverse client needs:
                </p>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="bg-[#1E90DB] text-white p-2 rounded-full mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-montserrat font-bold mb-1">Pre-Construction Services</h5>
                    <p className="text-gray-700">Ensuring every project begins with a solid foundation, from feasibility studies to budgeting and planning.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#1E90DB] text-white p-2 rounded-full mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-montserrat font-bold mb-1">Design-Build Solutions</h5>
                    <p className="text-gray-700">Seamlessly integrating design and construction for streamlined, cost-effective, and timely project delivery.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#1E90DB] text-white p-2 rounded-full mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-montserrat font-bold mb-1">Project Management</h5>
                    <p className="text-gray-700">Orchestrating every phase with precision to guarantee smooth execution and completion.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#1E90DB] text-white p-2 rounded-full mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-montserrat font-bold mb-1">Tenant Improvement</h5>
                    <p className="text-gray-700">Transforming commercial and residential spaces to enhance functionality and aesthetics.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#1E90DB] text-white p-2 rounded-full mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-montserrat font-bold mb-1">Housing Development</h5>
                    <p className="text-gray-700">Creating sustainable, high-quality living spaces that enrich communities.</p>
                  </div>
                </div>
              </div>
              
              <div className="relative h-80 mt-12">
                <img 
                  src="https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80" 
                  alt="Construction project" 
                  className="w-full h-full object-cover rounded-md shadow-xl"
                />
                <div className="absolute -bottom-5 -left-5 bg-[#1E90DB] text-white p-4 rounded shadow-lg">
                  <p className="font-montserrat font-bold text-xl">100%</p>
                  <p className="text-sm">Client Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <h2 className="text-sm font-montserrat text-[#1E90DB] mb-4">OUR VALUES</h2>
            <h3 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">What Drives Us Forward</h3>
            <p className="text-gray-600 leading-relaxed">
              Our core values guide everything we do, from how we interact with clients to how we approach each project.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-lg hover-scale reveal">
              <div className="text-[#1E90DB] mb-6">
                <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-montserrat font-bold mb-4">Excellence</h4>
              <p className="text-gray-600 leading-relaxed">
                We strive for excellence in every aspect of our work, from planning and design to execution and follow-up.
              </p>
            </div>
            
            <div className="bg-white p-8 shadow-lg hover-scale reveal">
              <div className="text-[#1E90DB] mb-6">
                <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-montserrat font-bold mb-4">Collaboration</h4>
              <p className="text-gray-600 leading-relaxed">
                We believe in the power of teamwork and partnership, working closely with clients and partners to achieve shared goals.
              </p>
            </div>
            
            <div className="bg-white p-8 shadow-lg hover-scale reveal">
              <div className="text-[#1E90DB] mb-6">
                <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-montserrat font-bold mb-4">Innovation</h4>
              <p className="text-gray-600 leading-relaxed">
                We continuously seek new technologies, methods, and ideas to deliver better results and exceed expectations.
              </p>
            </div>
            
            <div className="bg-white p-8 shadow-lg hover-scale reveal">
              <div className="text-[#1E90DB] mb-6">
                <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-montserrat font-bold mb-4">Reliability</h4>
              <p className="text-gray-600 leading-relaxed">
                We honor our commitments and deliver on time and within budget, building trust through consistent performance.
              </p>
            </div>
            
            <div className="bg-white p-8 shadow-lg hover-scale reveal">
              <div className="text-[#1E90DB] mb-6">
                <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h4 className="text-xl font-montserrat font-bold mb-4">Sustainability</h4>
              <p className="text-gray-600 leading-relaxed">
                We integrate environmentally responsible practices into our projects, minimizing impact and maximizing resource efficiency.
              </p>
            </div>
            
            <div className="bg-white p-8 shadow-lg hover-scale reveal">
              <div className="text-[#1E90DB] mb-6">
                <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 className="text-xl font-montserrat font-bold mb-4">Safety</h4>
              <p className="text-gray-600 leading-relaxed">
                We prioritize the safety of our team, clients, and the public, maintaining rigorous standards across all operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <h2 className="text-sm font-montserrat text-[#1E90DB] mb-4">OUR TEAM</h2>
            <h3 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">Meet Our Leadership</h3>
            <p className="text-gray-600 leading-relaxed">
              Our experienced leadership team brings decades of industry expertise and a passion for excellence to every project.
            </p>
          </div>
          
          {isLoadingTeamMembers ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#1E90DB]" />
            </div>
          ) : teamMembers && Array.isArray(teamMembers) && teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member: TeamMember, index: number) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden group">
                    <img 
                      src={member.photo && !member.photo.includes("placeholder-person.jpg") 
                        ? member.photo 
                        : (member.gender === "female" 
                          ? "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='450' height='450' viewBox='0 0 24 24' fill='%231E90DB' stroke='white' stroke-width='0.3' stroke-linecap='round' stroke-linejoin='round'%3e%3crect width='24' height='24' fill='%23e6f3ff' rx='12' ry='12'/%3e%3ccircle cx='12' cy='8' r='4.5' fill='%231E90DB'/%3e%3cpath d='M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2' fill='%231E90DB'/%3e%3c/svg%3e" 
                          : "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='450' height='450' viewBox='0 0 24 24' fill='%231E90DB' stroke='white' stroke-width='0.3' stroke-linecap='round' stroke-linejoin='round'%3e%3crect width='24' height='24' fill='%23e6f3ff' rx='12' ry='12'/%3e%3ccircle cx='12' cy='8' r='4.5' fill='%231E90DB'/%3e%3cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' fill='%231E90DB'/%3e%3c/svg%3e")} 
                      alt={member.name} 
                      className={`w-full h-80 transition-transform duration-500 group-hover:scale-110 ${
                        !member.photo || member.photo.includes("placeholder-person.jpg") 
                          ? "object-contain p-6 md:p-10 bg-gray-50" 
                          : "object-cover object-center"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        {member.bio && (
                          <p className="line-clamp-3">{member.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-montserrat font-bold mb-1">{member.name}</h4>
                    <p className="text-[#1E90DB] font-montserrat mb-1">{member.designation}</p>
                    <p className="text-gray-500 text-sm font-montserrat">{member.qualification}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No team members found. Please check back later.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white text-center">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6 reveal">Ready to Start Your Project?</h2>
          <p className="text-lg max-w-2xl mx-auto mb-10 reveal">
            Let's discuss how ARCEM can bring your construction vision to life with our expertise and dedication to excellence.
          </p>
          <div className="reveal">
            <Link href="/contact">
              <Button variant="gold" size="default">
                REACH US TODAY
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
