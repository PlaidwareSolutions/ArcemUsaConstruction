import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Simulated accessibility violations for demo purposes
// In a real implementation, we would use @axe-core/react properly
type AccessibilityViolation = {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
};

// Mock data for demo purposes
const mockViolations: AccessibilityViolation[] = [
  {
    id: 'color-contrast',
    impact: 'serious',
    description: 'Elements must have sufficient color contrast',
    help: 'Elements must have sufficient color contrast',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
    nodes: [
      {
        html: '<p class="text-gray-300">Low contrast text</p>',
        target: ['#header-navigation .nav-link'],
        failureSummary: 'Element has insufficient color contrast of 2.5:1 (foreground color: #f5f5f5, background color: #ffffff, font size: 12.0pt, font weight: normal). Expected contrast ratio of 4.5:1'
      }
    ]
  },
  {
    id: 'image-alt',
    impact: 'critical',
    description: 'Images must have alternate text',
    help: 'Images must have alternate text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
    nodes: [
      {
        html: '<img src="/images/hero-image.jpg">',
        target: ['.hero-section img'],
        failureSummary: 'Element does not have an alt attribute'
      }
    ]
  },
  {
    id: 'aria-roles',
    impact: 'moderate',
    description: 'ARIA roles must be valid',
    help: 'ARIA roles used must conform to valid values',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/aria-roles',
    nodes: [
      {
        html: '<div role="navigation" aria-role="invalid">Main Menu</div>',
        target: ['nav div[role="navigation"]'],
        failureSummary: 'Element has invalid ARIA attribute. Invalid attribute: aria-role'
      }
    ]
  }
];

export const checkAccessibility = async (): Promise<AccessibilityViolation[]> => {
  // In a real implementation, we would use axe-core to analyze the DOM
  // For now, we'll just simulate the analysis with a delay and mock data
  return new Promise(resolve => {
    setTimeout(() => {
      // Return either all violations or a random subset to simulate different results
      if (Math.random() > 0.5) {
        resolve(mockViolations.filter(() => Math.random() > 0.3));
      } else {
        resolve([]);
      }
    }, 1500);
  });
};

export function AccessibilityChecker({ showAlways = false }: { showAlways?: boolean }) {
  const [violations, setViolations] = useState<AccessibilityViolation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  const runAccessibilityCheck = async () => {
    setIsChecking(true);
    const results = await checkAccessibility();
    setViolations(results);
    setIsChecking(false);
    setIsOpen(true);
  };

  useEffect(() => {
    // Only run automatically in development
    if (process.env.NODE_ENV === 'development' && showAlways) {
      runAccessibilityCheck();
    }
  }, [showAlways]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'serious':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'destructive';
      case 'serious':
        return 'destructive';
      case 'moderate':
        return 'default';
      case 'minor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Only show floating button in development mode
  if (process.env.NODE_ENV !== 'development' && !showAlways) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          className="bg-white flex items-center gap-2 shadow-md"
          onClick={runAccessibilityCheck}
          disabled={isChecking}
        >
          {isChecking ? (
            <><span className="animate-spin">⟳</span> Checking...</>
          ) : (
            <><AlertTriangle className="h-4 w-4" /> A11y Check</>
          )}
        </Button>
      </div>

      {isOpen && violations.length > 0 && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 bg-[#1E90DB] text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">
                Accessibility Issues Found ({violations.length})
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {violations.length > 0 ? (
                <div className="space-y-6">
                  {violations.map((violation) => (
                    <div 
                      key={violation.id} 
                      className={`border rounded-lg p-4 ${getImpactColor(violation.impact)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{violation.help}</h3>
                        <Badge variant={getImpactBadge(violation.impact) as any}>
                          {violation.impact}
                        </Badge>
                      </div>
                      <p className="mb-2">{violation.description}</p>
                      <a 
                        href={violation.helpUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mb-4 inline-block"
                      >
                        Learn more
                      </a>
                      
                      <div className="mt-3 space-y-3">
                        {violation.nodes.map((node, i) => (
                          <div key={i} className="bg-white p-3 rounded border text-sm">
                            <div className="font-mono text-xs bg-gray-100 p-2 rounded mb-2 overflow-x-auto">
                              {node.html}
                            </div>
                            <div>
                              <span className="font-medium">Element:</span> {node.target.join(', ')}
                            </div>
                            <div className="mt-1">
                              <span className="font-medium">Issue:</span> {node.failureSummary}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Check className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-lg font-medium">No accessibility issues found!</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-between">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button onClick={runAccessibilityCheck} disabled={isChecking}>
                {isChecking ? "Checking..." : "Run Check Again"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isOpen && violations.length === 0 && !isChecking && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 flex flex-col items-center">
              <Check className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">No Issues Found!</h2>
              <p className="text-center text-gray-600 mb-6">
                Your page passed all accessibility checks. Good job!
              </p>
              <Button onClick={() => setIsOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// This can be used to inject the checker into any page
export const injectAccessibilityChecker = (showAlways = false) => {
  const containerID = 'accessibility-checker-container';
  let container = document.getElementById(containerID);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerID;
    document.body.appendChild(container);
  }
  
  // Use direct render for React
  ReactDOM.render(<AccessibilityChecker showAlways={showAlways} />, container);
};