import { useState, useEffect } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { checkAccessibility } from '@/lib/accessibility';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Types imported from accessibility.tsx
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

// Group violations by category
function groupViolationsByCategory(violations: AccessibilityViolation[]) {
  const categories = {
    contrast: violations.filter(v => v.id.includes('contrast')),
    aria: violations.filter(v => v.id.includes('aria')),
    structure: violations.filter(v => 
      v.id.includes('heading') || 
      v.id.includes('landmark') || 
      v.id.includes('region') ||
      v.id.includes('document')
    ),
    forms: violations.filter(v => 
      v.id.includes('label') || 
      v.id.includes('input') || 
      v.id.includes('form')
    ),
    images: violations.filter(v => v.id.includes('image') || v.id.includes('alt')),
    links: violations.filter(v => v.id.includes('link')),
    other: [] as AccessibilityViolation[]
  };

  // Add any remaining violations to "other"
  categories.other = violations.filter(v => 
    !Object.values(categories).some(category => category.includes(v))
  );

  return categories;
}

function getSeverityCount(violations: AccessibilityViolation[], severity: string) {
  return violations.filter(v => v.impact === severity).length;
}

const AccessibilityCheckerPage = () => {
  const { user, loading } = useAuth();
  const [violations, setViolations] = useState<AccessibilityViolation[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const groups = groupViolationsByCategory(violations);
  
  const runCheck = async () => {
    setIsChecking(true);
    try {
      // Using the mock function for now
      const results = await checkAccessibility();
      setViolations(results);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error running accessibility check:', error);
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    // Run a check automatically when page loads
    runCheck();
  }, []);

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

  const renderViolationsList = (violationsList: AccessibilityViolation[]) => {
    if (violationsList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Check className="h-12 w-12 text-green-500 mb-4" />
          <p className="text-lg font-medium">No issues found in this category!</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {violationsList.map((violation) => (
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
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E90DB]" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          <AdminNav activePage="accessibility" />
          
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-2xl font-montserrat font-bold mb-2">Accessibility Checker</h1>
              <p className="text-gray-600 mb-4">
                Check your website for accessibility issues and ensure compliance with WCAG guidelines.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button 
                  onClick={runCheck} 
                  disabled={isChecking}
                  className="bg-[#1E90DB] hover:bg-[#1670B0]"
                >
                  {isChecking ? 
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running check...</> : 
                    <><AlertTriangle className="mr-2 h-4 w-4" /> Run Accessibility Check</>
                  }
                </Button>
                
                {lastChecked && (
                  <p className="text-sm text-gray-500 flex items-center mt-2">
                    Last checked: {lastChecked.toLocaleString()}
                  </p>
                )}
              </div>
              
              {/* Summary Cards */}
              {violations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{violations.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-red-600">Critical</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{getSeverityCount(violations, 'critical')}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-orange-600">Serious</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{getSeverityCount(violations, 'serious')}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-yellow-600">Moderate/Minor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {getSeverityCount(violations, 'moderate') + getSeverityCount(violations, 'minor')}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Tab Interface */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                <TabsList className="mb-4 border">
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#1E90DB] data-[state=active]:text-white">
                    All Issues ({violations.length})
                  </TabsTrigger>
                  <TabsTrigger value="contrast" className="data-[state=active]:bg-[#1E90DB] data-[state=active]:text-white">
                    Contrast ({groups.contrast.length})
                  </TabsTrigger>
                  <TabsTrigger value="aria" className="data-[state=active]:bg-[#1E90DB] data-[state=active]:text-white">
                    ARIA ({groups.aria.length})
                  </TabsTrigger>
                  <TabsTrigger value="structure" className="data-[state=active]:bg-[#1E90DB] data-[state=active]:text-white">
                    Structure ({groups.structure.length})
                  </TabsTrigger>
                  <TabsTrigger value="forms" className="data-[state=active]:bg-[#1E90DB] data-[state=active]:text-white">
                    Forms ({groups.forms.length})
                  </TabsTrigger>
                  <TabsTrigger value="images" className="data-[state=active]:bg-[#1E90DB] data-[state=active]:text-white">
                    Images ({groups.images.length})
                  </TabsTrigger>
                  <TabsTrigger value="links" className="data-[state=active]:bg-[#1E90DB] data-[state=active]:text-white">
                    Links ({groups.links.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="border rounded-lg p-4">
                  {isChecking ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      <span>Checking for accessibility issues...</span>
                    </div>
                  ) : violations.length > 0 ? (
                    renderViolationsList(violations)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Check className="h-12 w-12 text-green-500 mb-4" />
                      <p className="text-lg font-medium">No accessibility issues found!</p>
                      <p className="text-gray-600 mt-2">
                        Your website passed all accessibility checks. Great job!
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="contrast" className="border rounded-lg p-4">
                  {renderViolationsList(groups.contrast)}
                </TabsContent>
                
                <TabsContent value="aria" className="border rounded-lg p-4">
                  {renderViolationsList(groups.aria)}
                </TabsContent>
                
                <TabsContent value="structure" className="border rounded-lg p-4">
                  {renderViolationsList(groups.structure)}
                </TabsContent>
                
                <TabsContent value="forms" className="border rounded-lg p-4">
                  {renderViolationsList(groups.forms)}
                </TabsContent>
                
                <TabsContent value="images" className="border rounded-lg p-4">
                  {renderViolationsList(groups.images)}
                </TabsContent>
                
                <TabsContent value="links" className="border rounded-lg p-4">
                  {renderViolationsList(groups.links)}
                </TabsContent>
              </Tabs>
              
              {/* Accessibility Guidelines */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Accessibility Resources</CardTitle>
                  <CardDescription>
                    Learn more about web accessibility and how to fix common issues.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="https://www.w3.org/WAI/WCAG21/quickref/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        WCAG 2.1 Quick Reference
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://webaim.org/articles/contrast/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        WebAIM: Color Contrast Checker
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        MDN: ARIA - Accessible Rich Internet Applications
                      </a>
                    </li>
                    <li>
                      <a 
                        href="https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        MDN: HTML and Accessibility
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityCheckerPage;