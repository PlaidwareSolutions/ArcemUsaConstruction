import { useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { scrollToTop, initializeRevealEffects } from '@/lib/utils';
import { FileText, FileSpreadsheet, Download, ArrowRight, FileIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const documentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
};

interface SubcontractorDocument {
  id: number;
  title: string;
  fileName: string;
  description: string;
  fileType: 'docx' | 'xlsx';
}

const Resources = () => {
  useEffect(() => {
    scrollToTop();
    document.title = 'Subcontractor Resources - ARCEM';
    initializeRevealEffects(true);
  }, []);

  // Document data
  const subcontractorDocuments: SubcontractorDocument[] = [
    {
      id: 1,
      title: 'Master Subcontractor Agreement',
      fileName: 'Master-Subcontractor-Agreement.docx',
      description: 'Standard agreement outlining terms and conditions for subcontractor work.',
      fileType: 'docx'
    },
    {
      id: 2,
      title: 'Subcontractor Scope of Work',
      fileName: 'Subcontractor Scope of Work.docx',
      description: 'Template for defining the scope of work for a specific project.',
      fileType: 'docx'
    },
    {
      id: 3,
      title: 'W-9 Form',
      fileName: 'W-9-Form.docx',
      description: 'Required tax documentation for all subcontractors.',
      fileType: 'docx'
    },
    {
      id: 4,
      title: 'Subcontractor Payment Application',
      fileName: 'Subcontractor Payment Application.xlsx',
      description: 'Form for submitting payment requests for completed work.',
      fileType: 'xlsx'
    },
    {
      id: 5,
      title: 'Subcontractor Suppliers List',
      fileName: 'Subcontractor Suppliers List.xlsx',
      description: 'Form to document all suppliers used for a project.',
      fileType: 'xlsx'
    },
    {
      id: 6,
      title: 'Subcontractor Final Lien Release (Conditional)',
      fileName: 'Subcontractor Final Lien Release  Conditional.docx',
      description: 'Conditional lien waiver to be submitted with final payment request.',
      fileType: 'docx'
    },
    {
      id: 7,
      title: 'Subcontractor Final Lien Release (Unconditional)',
      fileName: 'Subcontractor Final Lien Release  unConditional.docx',
      description: 'Unconditional lien waiver to be submitted after final payment is received.',
      fileType: 'docx'
    },
    {
      id: 8,
      title: 'Subcontractor Progress Lien Release (Conditional)',
      fileName: 'Subcontractor Progress Lien Release  Conditional.docx',
      description: 'Conditional lien waiver to be submitted with progress payment requests.',
      fileType: 'docx'
    },
    {
      id: 9,
      title: 'Subcontractor Progress Lien Release (Unconditional)',
      fileName: 'Subcontractor Progress Lien Release  unConditional.docx',
      description: 'Unconditional lien waiver to be submitted after progress payment is received.',
      fileType: 'docx'
    },
    {
      id: 10,
      title: 'Subcontractor\'s Warranty Certificate',
      fileName: 'Subcontractor\'s Warranty Certificate.docx',
      description: 'Warranty documentation to be completed for all completed work.',
      fileType: 'docx'
    },
    {
      id: 11,
      title: 'Subcontractor\'s Supplier Final Lien Release (Conditional)',
      fileName: 'Subcontractor\'s Supplier Final Lien Release  Conditional.docx',
      description: 'Conditional lien waiver for suppliers to be submitted with final payment request.',
      fileType: 'docx'
    },
    {
      id: 12,
      title: 'Subcontractor\'s Supplier Final Lien Release (Unconditional)',
      fileName: 'Subcontractor\'s Supplier Final Lien Release  unConditional.docx',
      description: 'Unconditional lien waiver for suppliers to be submitted after final payment is received.',
      fileType: 'docx'
    },
    {
      id: 13,
      title: 'Subcontractor\'s Supplier Progress Lien Release (Conditional)',
      fileName: 'Subcontractor\'s Supplier Progress Lien Release  Conditional.docx',
      description: 'Conditional lien waiver for suppliers to be submitted with progress payment requests.',
      fileType: 'docx'
    },
    {
      id: 14,
      title: 'Subcontractor\'s Supplier Progress Lien Release (Unconditional)',
      fileName: 'Subcontractor\'s Supplier Progress Lien Release  unConditional.docx',
      description: 'Unconditional lien waiver for suppliers to be submitted after progress payment is received.',
      fileType: 'docx'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div 
        className="relative h-[350px] flex items-center justify-center" 
        style={{
          backgroundImage: "url('/uploads/images/resources/arisa-chattasa-0LaBRkmH4fM-unsplash.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <motion.div 
          className="relative z-10 text-center px-4 py-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-white text-4xl md:text-5xl font-montserrat font-bold mb-4">
            Subcontractor Resources
          </h1>
          <p className="text-white text-lg md:text-xl font-light max-w-3xl mx-auto">
            Download the necessary forms and templates for working with ARCEM
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4 text-gray-800">
              Document Library
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Access all the documents and forms needed for our subcontractor partnership.
              Click on any document to download.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {subcontractorDocuments.map((doc) => (
              <motion.div 
                key={doc.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                variants={documentVariants}
                whileHover="hover"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {doc.fileType === 'docx' ? (
                      <FileText className="h-10 w-10 text-blue-600" />
                    ) : (
                      <FileSpreadsheet className="h-10 w-10 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{doc.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{doc.description}</p>
                    <a 
                      href={`/documents/${doc.fileName}`} 
                      download
                      className="inline-flex items-center text-[#1E90DB] hover:text-[#1670B0] font-medium"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download {doc.fileType === 'docx' ? 'Document' : 'Spreadsheet'}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-montserrat font-bold mb-6">Ready to Join Our Team?</h2>
            <p className="text-lg text-gray-600 mb-8">
              If you have reviewed our forms and are ready to apply as a subcontractor,
              we'd love to have you as part of our network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/subcontractors">
                <Button size="lg" className="bg-[#1E90DB] hover:bg-[#1670B0]">
                  Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/join-us">
                <Button size="lg" variant="outline" className="border-[#1E90DB] text-[#1E90DB] hover:bg-[#1E90DB] hover:text-white">
                  Learn More
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p className="font-medium">Phone Numbers:</p>
                  <p>Cell: (713) 624-0083</p>
                  <p>Office: (713) 624-0313</p>
                </div>
                <div>
                  <p className="font-medium">Email Addresses:</p>
                  <p><a href="mailto:aj@arcemusa.com" className="text-[#1E90DB] hover:underline">aj@arcemusa.com</a></p>
                  <p><a href="mailto:admin@arcemusa.com" className="text-[#1E90DB] hover:underline">admin@arcemusa.com</a></p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Resources;