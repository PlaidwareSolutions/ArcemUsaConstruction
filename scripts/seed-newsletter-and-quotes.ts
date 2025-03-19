import { db } from '../server/db';
import { newsletterSubscribers, quoteRequests } from '../shared/schema';

async function seedNewsletterAndQuotes() {
  console.log('Seeding newsletter subscribers and quote requests...');

  // Sample newsletter subscribers
  const newsletterData = [
    {
      email: 'johndoe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      subscribed: true,
      createdAt: new Date('2025-01-15')
    },
    {
      email: 'janesmith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      subscribed: true,
      createdAt: new Date('2025-01-20')
    },
    {
      email: 'michaeljordan@example.com',
      firstName: 'Michael',
      lastName: 'Jordan',
      subscribed: true,
      createdAt: new Date('2025-02-05')
    },
    {
      email: 'sarahjones@example.com',
      firstName: 'Sarah',
      lastName: 'Jones',
      subscribed: true,
      createdAt: new Date('2025-02-15')
    },
    {
      email: 'robertbrown@example.com',
      firstName: 'Robert',
      lastName: 'Brown',
      subscribed: false,
      createdAt: new Date('2025-01-10')
    }
  ];

  console.log('Adding newsletter subscribers...');
  for (const subscriber of newsletterData) {
    await db.insert(newsletterSubscribers).values(subscriber).onConflictDoNothing();
  }

  // Sample quote requests
  const quoteData = [
    {
      name: 'John Miller',
      email: 'johnmiller@example.com',
      phone: '555-123-4567',
      company: 'Miller Enterprises',
      projectType: 'Commercial Construction',
      projectSize: '10,000-20,000 sq ft',
      budget: '$1M-$2M',
      timeframe: '6-12 months',
      description: 'We need a new office building with modern design and eco-friendly features. Looking for a construction partner that can handle the entire project from design to completion.',
      status: 'pending',
      reviewed: false,
      createdAt: new Date('2025-02-20')
    },
    {
      name: 'Amanda Wilson',
      email: 'amandawilson@example.com',
      phone: '555-987-6543',
      company: 'Wilson Family',
      projectType: 'Residential Construction',
      projectSize: '3,000-5,000 sq ft',
      budget: '$500K-$750K',
      timeframe: '4-8 months',
      description: 'Custom home construction for our family of 5. We have architectural drawings ready and are looking for a builder to bring our dream home to life.',
      status: 'in-progress',
      reviewed: true,
      createdAt: new Date('2025-02-25')
    },
    {
      name: 'David Thompson',
      email: 'davidthompson@example.com',
      phone: '555-456-7890',
      company: 'Thompson Retail Group',
      projectType: 'Retail Construction',
      projectSize: '5,000-8,000 sq ft',
      budget: '$750K-$1M',
      timeframe: '3-6 months',
      description: 'Retail store renovation in downtown area. Need to completely redesign the interior while preserving the historic exterior of the building.',
      status: 'completed',
      reviewed: true,
      createdAt: new Date('2025-01-15')
    },
    {
      name: 'Lisa Rodriguez',
      email: 'lisarodriguez@example.com',
      phone: '555-789-0123',
      company: 'Community Center',
      projectType: 'Public Construction',
      projectSize: '15,000-25,000 sq ft',
      budget: '$2M-$3M',
      timeframe: '12-18 months',
      description: 'New community center construction including gymnasium, meeting rooms, and outdoor recreational areas. Project is partially funded by municipal grants.',
      status: 'pending',
      reviewed: true,
      createdAt: new Date('2025-03-01')
    },
    {
      name: 'Robert Chen',
      email: 'robertchen@example.com',
      phone: '555-345-6789',
      company: 'Chen Industries',
      projectType: 'Industrial Construction',
      projectSize: '30,000+ sq ft',
      budget: '$3M-$5M',
      timeframe: '12-24 months',
      description: 'Manufacturing facility expansion with special requirements for heavy machinery installation and compliance with industry-specific regulations.',
      status: 'pending',
      reviewed: false,
      createdAt: new Date('2025-03-05')
    }
  ];

  console.log('Adding quote requests...');
  for (const quote of quoteData) {
    await db.insert(quoteRequests).values(quote).onConflictDoNothing();
  }

  console.log('Seeding completed successfully!');
}

seedNewsletterAndQuotes().catch(error => {
  console.error('Error seeding data:', error);
  process.exit(1);
}).finally(() => {
  process.exit(0);
});