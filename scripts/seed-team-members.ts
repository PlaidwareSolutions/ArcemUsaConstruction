// Script to seed initial team members
import { db } from '../server/db';

async function seedTeamMembers() {
  try {
    console.log("Starting to seed team members...");

    // Add team members - direct SQL insert
    await db.execute(`
      INSERT INTO team_members (name, qualification, designation, gender, photo, active, "order", "createdAt", "updatedAt")
      VALUES 
      ('Aamir (AJ) Qadri', 'CDCM, CQM-C', 'President', 'male', '/uploads/images/team/placeholder-person.jpg', true, 1, NOW(), NOW()),
      ('Nadia Khalid', 'MBA', 'Vice President', 'female', '/uploads/images/team/placeholder-person.jpg', true, 2, NOW(), NOW()),
      ('Ahmad Mujtaba (AK)', 'BBA Business & Finance', 'Admin & Project Manager', 'male', '/uploads/images/team/placeholder-person.jpg', true, 3, NOW(), NOW()),
      ('M. Shehryar', 'B.Arch', 'Architect & Interior designer', 'male', '/uploads/images/team/placeholder-person.jpg', true, 4, NOW(), NOW())
    `);

    console.log("Team members seeded successfully!");
  } catch (error) {
    console.error("Error seeding team members:", error);
  } finally {
    process.exit(0);
  }
}

seedTeamMembers();