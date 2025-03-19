import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function seedJobData() {
  try {
    console.log("Seeding job postings data...");
    
    // Check if we already have job postings
    const jobCount = await db.execute(sql`SELECT COUNT(*) as count FROM job_postings`);
    const result = jobCount as unknown as { rows: { count: string }[] };
    const count = parseInt(result.rows[0].count);
    
    if (count > 0) {
      console.log(`✅ Job postings table already has ${count} records. Skipping seed.`);
      return;
    }
    
    // Insert sample jobs
    await db.execute(sql`
      INSERT INTO job_postings 
        (title, department, location, type, description, responsibilities, requirements, benefits, salary, active, featured)
      VALUES 
        (
          'Senior Project Manager', 
          'Project Management', 
          'Chicago, IL', 
          'full-time',
          'We are seeking an experienced Project Manager to oversee large-scale commercial construction projects from inception to completion. The ideal candidate will have a proven track record of delivering projects on time and within budget while maintaining high quality standards.',
          'Oversee all aspects of construction projects from pre-construction to closeout
Develop and maintain project schedules, budgets, and resource allocation plans
Coordinate with architects, engineers, subcontractors, and regulatory agencies
Conduct regular site visits to monitor progress and ensure quality control
Manage project documentation, including contracts, change orders, and permits
Identify and mitigate project risks and resolve issues promptly
Lead client meetings and provide regular progress updates
Mentor junior project team members',
          'Bachelor''s degree in Construction Management, Civil Engineering, or related field
7+ years of experience in construction project management
PMP certification or equivalent
Proficient in project management software and MS Office Suite
Strong understanding of construction methods, building codes, and industry standards
Excellent communication, leadership, and problem-solving skills
Experience with commercial construction projects valued at $10M+',
          'Competitive salary and performance bonuses
Comprehensive health, dental, and vision insurance
401(k) retirement plan with company match
Paid time off and holidays
Professional development opportunities
Company vehicle or allowance',
          '$90,000 - $120,000 per year, based on experience',
          TRUE,
          TRUE
        ),
        (
          'Construction Superintendent', 
          'Field Operations', 
          'Miami, FL', 
          'full-time',
          'ARCEM is looking for a skilled Construction Superintendent to oversee day-to-day field operations on our residential and commercial construction sites. You will be responsible for coordinating subcontractors, ensuring safety compliance, and maintaining quality control standards.',
          'Supervise and coordinate all on-site construction activities
Ensure projects adhere to schedules, specifications, and budgets
Implement and enforce safety protocols and quality control measures
Coordinate material deliveries and manage on-site inventory
Conduct daily subcontractor meetings to review progress and resolve issues
Maintain detailed daily logs and progress reports
Collaborate with Project Managers to address any site challenges
Inspect work for compliance with building codes and project specifications',
          'Minimum 5 years of experience as a Construction Superintendent
Strong knowledge of construction methods, materials, and building codes
OSHA 30-hour certification
Experience with scheduling and coordinating subcontractors
Ability to read and interpret construction plans and specifications
Excellent problem-solving and communication skills
Valid driver''s license and reliable transportation',
          'Competitive salary based on experience
Comprehensive health and dental insurance
401(k) retirement plan
Paid time off and holidays
Company truck and fuel allowance
Cell phone allowance
Opportunities for advancement',
          '$75,000 - $95,000 per year, based on experience',
          TRUE,
          TRUE
        ),
        (
          'Civil Engineer', 
          'Engineering', 
          'Denver, CO', 
          'full-time',
          'Join our engineering team as a Civil Engineer responsible for designing and developing infrastructure for our commercial and industrial construction projects. You will work closely with project teams to provide technical expertise and innovative solutions.',
          'Develop civil engineering designs for construction projects
Create site development plans, including grading, drainage, and utilities
Perform engineering calculations and prepare technical specifications
Review and approve shop drawings and submittals
Coordinate with architects, contractors, and regulatory agencies
Conduct site visits to monitor construction progress
Ensure compliance with applicable codes and regulations
Prepare permit applications and supporting documentation',
          'Bachelor''s degree in Civil Engineering (Master''s preferred)
Professional Engineer (PE) license
3+ years of experience in civil engineering for construction projects
Proficiency in AutoCAD, Civil 3D, and other relevant software
Knowledge of local building codes and regulations
Strong analytical and problem-solving skills
Excellent written and verbal communication abilities',
          'Competitive salary and performance bonuses
Health, dental, and vision insurance
401(k) retirement plan with company match
Professional development and license renewal support
Paid time off and holidays
Flexible work arrangements
Collaborative team environment',
          '$70,000 - $90,000 per year, depending on qualifications',
          TRUE,
          FALSE
        ),
        (
          'Estimator', 
          'Preconstruction', 
          'Atlanta, GA', 
          'full-time',
          'We are seeking a detail-oriented Estimator to join our preconstruction team. In this role, you will be responsible for developing accurate cost estimates for construction projects, analyzing drawings and specifications, and supporting the bid process.',
          'Prepare detailed cost estimates for construction projects
Review plans, specifications, and contract documents
Solicit and analyze subcontractor and supplier quotes
Identify cost-saving opportunities and value engineering solutions
Participate in pre-bid meetings and site visits
Assist in developing project budgets and schedules
Support the bid preparation and submission process
Maintain current knowledge of material costs and market trends',
          'Bachelor''s degree in Construction Management, Engineering, or related field
3+ years of experience in construction estimating
Proficiency in estimating software and MS Excel
Strong understanding of construction methods and materials
Ability to read and interpret construction documents
Excellent analytical and mathematical skills
Attention to detail and accuracy
Strong communication and negotiation abilities',
          'Competitive salary
Comprehensive benefits package
401(k) retirement plan
Professional development opportunities
Paid time off
Collaborative work environment',
          '$65,000 - $85,000 per year, commensurate with experience',
          TRUE,
          FALSE
        ),
        (
          'Safety Manager', 
          'Safety & Compliance', 
          'Chicago, IL', 
          'full-time',
          'ARCEM is seeking a Safety Manager to develop, implement, and oversee our company-wide safety program across all project sites. The ideal candidate will have a strong background in construction safety and a passion for creating a culture of safety excellence.',
          'Develop and maintain company safety policies and procedures
Conduct regular safety inspections and audits of project sites
Investigate incidents and near-misses and implement corrective actions
Provide safety training for employees and subcontractors
Ensure compliance with OSHA and other regulatory requirements
Track and report safety metrics and performance indicators
Collaborate with project teams to address safety concerns
Stay current with industry best practices and regulations',
          'Bachelor''s degree in Safety Management, Construction Management, or related field
OSHA 30-hour certification (CHST or CSP preferred)
5+ years of experience in construction safety management
Knowledge of federal, state, and local safety regulations
Strong leadership and communication skills
Experience with safety training and program development
Proficiency with safety management software
Valid driver''s license and ability to travel to multiple project sites',
          'Competitive salary
Comprehensive health benefits
401(k) retirement plan with company match
Professional development and certification support
Company vehicle or allowance
Paid time off and holidays',
          '$75,000 - $95,000 annually, based on experience and certifications',
          TRUE,
          FALSE
        ),
        (
          'Project Engineer', 
          'Project Management', 
          'Miami, FL', 
          'full-time',
          'We are looking for a Project Engineer to support our project management team on commercial construction projects. This position is ideal for candidates who are early in their construction career and eager to learn and grow with our company.',
          'Assist Project Managers with daily project activities
Review and process submittals, RFIs, and change orders
Maintain project documentation and filing systems
Prepare meeting minutes and track action items
Coordinate with subcontractors and suppliers
Perform quantity takeoffs and material tracking
Assist with quality control inspections
Support schedule updates and progress tracking',
          'Bachelor''s degree in Construction Management, Engineering, or related field
0-3 years of experience in construction (internship experience considered)
Familiarity with construction documents and procedures
Proficiency in MS Office Suite
Basic knowledge of construction methods and materials
Strong organizational and communication skills
Ability to work in a fast-paced team environment
Willingness to learn and take on new responsibilities',
          'Competitive entry-level salary
Health, dental, and vision insurance
401(k) retirement plan
Paid time off
Mentorship opportunities
Professional development and training
Clear career advancement path',
          '$55,000 - $70,000 per year',
          TRUE,
          FALSE
        ),
        (
          'Administrative Assistant', 
          'Administration', 
          'Denver, CO', 
          'full-time',
          'ARCEM is seeking an Administrative Assistant to provide support to our office operations. The ideal candidate will be organized, detail-oriented, and possess excellent communication skills to help maintain efficient office functions.',
          'Provide administrative support to executives and project teams
Manage phone calls, correspondence, and office communication
Coordinate meetings, travel arrangements, and office events
Maintain filing systems and organize office documentation
Process expense reports and invoices
Assist with basic accounting and data entry tasks
Order office supplies and manage inventory
Greet visitors and provide a professional front office presence',
          'High school diploma required, Associate''s degree preferred
2+ years of administrative or office experience
Proficiency in MS Office Suite (Word, Excel, Outlook)
Strong organizational and time management skills
Excellent written and verbal communication abilities
Professional demeanor and customer service orientation
Ability to handle confidential information with discretion
Experience in construction industry a plus',
          'Competitive hourly wage
Health benefits package
Paid time off and holidays
401(k) retirement plan
Professional work environment
Opportunity for growth and skill development',
          '$40,000 - $50,000 per year',
          TRUE,
          FALSE
        ),
        (
          'Marketing Coordinator', 
          'Marketing', 
          'Atlanta, GA', 
          'part-time',
          'We are looking for a part-time Marketing Coordinator to support our marketing and business development efforts. This role will assist with creating marketing materials, maintaining our online presence, and supporting proposal development.',
          'Assist with the creation of marketing materials and presentations
Update company website and social media platforms
Support the development of project proposals and qualifications packages
Coordinate photography for completed projects
Maintain marketing database and project information
Assist with industry events and client relationship activities
Track marketing metrics and reporting
Support public relations and community outreach initiatives',
          'Bachelor''s degree in Marketing, Communications, or related field
1-3 years of marketing experience, preferably in AEC industry
Proficiency in graphic design software (Adobe Creative Suite)
Experience with website management and social media platforms
Strong writing and editing skills
Knowledge of digital marketing strategies
Attention to detail and creative problem-solving abilities
Photography skills a plus',
          'Competitive hourly rate
Flexible work schedule (20-25 hours per week)
Paid time off
Professional development opportunities
Potential for growth to full-time position',
          '$25 - $30 per hour, based on experience',
          TRUE,
          FALSE
        )
    `);
    
    console.log("✅ Job postings data seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding job postings data:", error);
    throw error;
  }
}

// Run the seeding
seedJobData()
  .then(() => {
    console.log("Job data seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Job data seeding failed:", error);
    process.exit(1);
  });