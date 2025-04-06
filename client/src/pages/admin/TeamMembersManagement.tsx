import { useState, useEffect } from "react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { TeamMember, InsertTeamMember } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { scrollToTop } from '@/lib/utils';
import { Search, Plus, Edit, Trash2, Check, X, User, UserX, ArrowUpDown, Upload } from "lucide-react";
import AdminNav from '@/components/admin/AdminNav';
import UploadThingFileUpload from "@/components/common/UploadThingFileUpload";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportToExcel, formatDataForExport } from "@/utils/excelExport";

const teamMemberFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  designation: z.string().min(2, "Designation is required"),
  qualification: z.string().min(2, "Qualification is required"),
  gender: z.string().min(2, "Gender is required"),
  bio: z.string().optional(),
  photo: z.string().optional(),
  order: z.number().optional(),
  active: z.boolean().default(true),
});

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

export default function TeamMembersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, active, inactive

  const { toast } = useToast();
  const {
    allTeamMembers: teamMembers,
    isLoadingAll: isLoading,
    createTeamMember,
    updateTeamMember,
    toggleActiveStatus,
    updateOrder,
    deleteTeamMember,
    isCreating,
    isUpdating,
    isTogglingActive,
    isUpdatingOrder,
    isDeleting
  } = useTeamMembers();

  useEffect(() => {
    scrollToTop();
    document.title = 'Team Members Management - ARCEM';
  }, []);

  const createForm = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: "",
      designation: "",
      qualification: "",
      gender: "male",
      bio: "",
      order: 0,
      active: true,
    },
  });

  const editForm = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: "",
      designation: "",
      qualification: "",
      gender: "male",
      bio: "",
      order: 0,
      active: true,
    },
  });

  const teamMemberArray = Array.isArray(teamMembers) ? teamMembers : [];
  
  // Filter team members based on search query and active tab
  const filteredTeamMembers = teamMemberArray.filter((member) => {
    const searchMatches = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchQuery.toLowerCase());
      
    let statusMatches = true;
    if (activeTab === "active") statusMatches = member.active === true;
    if (activeTab === "inactive") statusMatches = member.active === false;
    
    return searchMatches && statusMatches;
  });

  // Sort by order
  filteredTeamMembers.sort((a, b) => (a.order || 0) - (b.order || 0));

  const activeCount = teamMemberArray.filter((member) => member.active === true).length;
  const inactiveCount = teamMemberArray.filter((member) => member.active === false).length;
  const totalCount = teamMemberArray.length;

  const onCreateSubmit = async (values: TeamMemberFormValues) => {
    try {
      // UploadThing has already uploaded the file and set the URL in the form
      // So we just use the values directly from the form
      let photoUrl = values.photo;
      
      // Use the uploaded file URL if it exists
      if (uploadedFileUrl) {
        photoUrl = uploadedFileUrl;
      }
      
      await createTeamMember({
        ...values,
        photo: photoUrl || null,
      });
      
      setIsCreateDialogOpen(false);
      createForm.reset();
      setUploadedFileUrl(null);
    } catch (error) {
      console.error("Error creating team member:", error);
    }
  };

  const onEditSubmit = async (values: TeamMemberFormValues) => {
    if (!selectedMember) return;
    
    try {
      let photoUrl = values.photo;
      
      // Use the uploaded file URL if it exists
      if (uploadedFileUrl) {
        photoUrl = uploadedFileUrl;
      }
      
      // If photo was removed in the UI, set it to null
      if (photoRemoved) {
        photoUrl = undefined;
      }
      
      await updateTeamMember(selectedMember.id, {
        ...values,
        photo: photoUrl,
      });
      
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedMember(null);
      setUploadedFileUrl(null);
      setPhotoRemoved(false);
    } catch (error) {
      console.error("Error updating team member:", error);
    }
  };

  const handleEditClick = (member: TeamMember) => {
    setSelectedMember(member);
    setPhotoRemoved(false);
    editForm.reset({
      name: member.name,
      designation: member.designation,
      qualification: member.qualification,
      gender: member.gender,
      bio: member.bio || "",
      photo: member.photo || "",
      order: member.order || 0,
      active: member.active || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMember) {
      deleteTeamMember(selectedMember.id);
      setSelectedMember(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleToggleActive = (member: TeamMember) => {
    toggleActiveStatus(member.id);
  };

  const handleRemovePhoto = () => {
    setUploadedFileUrl(null);
    setPhotoRemoved(true);
    if (isEditDialogOpen) {
      editForm.setValue('photo', '');
    } else {
      createForm.setValue('photo', '');
    }
  };
  
  const handleFileUploadComplete = (files: {
    fileName: string;
    fileUrl: string;
    fileKey: string;
    fileSize: number;
    fileType: string;
  }[]) => {
    if (files.length > 0) {
      setUploadedFileUrl(files[0].fileUrl);
      setPhotoRemoved(false);
      
      // Update the appropriate form with the new URL
      if (isEditDialogOpen) {
        editForm.setValue('photo', files[0].fileUrl);
      } else {
        createForm.setValue('photo', files[0].fileUrl);
      }
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleExportToExcel = () => {
    if (!teamMembers || teamMembers.length === 0) return;
    
    const formattedData = formatDataForExport(
      teamMembers, 
      ['id', 'updatedAt'], 
      ['createdAt']
    );
    
    exportToExcel(formattedData, 'team_members', 'Team Members');
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Navigation */}
          <AdminNav activePage="team-members" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-montserrat font-bold">Team Members Management</h1>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleExportToExcel}
                    disabled={!teamMembers || teamMembers.length === 0}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                  <Button variant="gold" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Team Member
                  </Button>
                </div>
              </div>
              
              {/* Status filter tabs */}
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6"
              >
                <TabsList className="mb-4 flex flex-wrap">
                  <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
                  <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive ({inactiveCount})</TabsTrigger>
                </TabsList>
              
                {/* Search bar */}
                <div className="mb-6 relative">
                  <Input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 border border-gray-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                
                {/* Team members table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Order</TableHead>
                        <TableHead className="w-[250px]">Name</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead className="hidden md:table-cell">Qualification</TableHead>
                        <TableHead className="hidden md:table-cell">Gender</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <div className="flex justify-center">
                              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredTeamMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                            No team members found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTeamMembers.map((member: TeamMember) => (
                          <TableRow key={member.id}>
                            <TableCell>{member.order || 0}</TableCell>
                            <TableCell className="font-medium flex items-center gap-2">
                              {member.photo ? (
                                <img 
                                  src={member.photo} 
                                  alt={member.name} 
                                  className="w-8 h-8 rounded-full object-cover" 
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                              {member.name}
                            </TableCell>
                            <TableCell>{member.designation}</TableCell>
                            <TableCell className="hidden md:table-cell">{member.qualification}</TableCell>
                            <TableCell className="hidden md:table-cell capitalize">{member.gender}</TableCell>
                            <TableCell>
                              {member.active ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>
                              ) : (
                                <Badge variant="outline">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(member)}
                                disabled={isTogglingActive}
                                title={member.active ? "Deactivate" : "Activate"}
                                className="text-slate-600 hover:text-slate-900 mr-1"
                              >
                                {member.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateOrder(member.id, (member.order || 0) + 1)}
                                disabled={isUpdatingOrder}
                                title="Move down (increase order)"
                                className="text-slate-600 hover:text-slate-900 mr-1"
                              >
                                <ArrowUpDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(member)}
                                title="Edit"
                                className="text-blue-600 hover:text-blue-900 mr-1"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(member)}
                                title="Delete"
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Create Team Member Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new team member to your company.
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-3">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="CEO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="MBA, Harvard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the team member"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo (Optional)</FormLabel>
                    <div className="flex flex-col gap-4">
                      <FormControl>
                        <div className="space-y-4">
                          <UploadThingFileUpload
                            onUploadComplete={handleFileUploadComplete}
                            uploadType="imageUploader"
                            maxFiles={1}
                            maxFileSize={4}
                            allowedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                          />
                          
                          {uploadedFileUrl && (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={uploadedFileUrl} 
                                  alt="Preview" 
                                  className="w-12 h-12 rounded-md object-cover" 
                                />
                                <span className="text-sm font-medium truncate max-w-[180px]">
                                  Team Member Photo
                                </span>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={handleRemovePhoto}
                                className="shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                    </div>
                    <FormDescription>
                      Upload a professional photo of the team member
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Display this team member on the website
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Add Team Member"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Team Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update the team member's information.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-3">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="CEO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="MBA, Harvard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the team member"
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo</FormLabel>
                    <div className="flex flex-col gap-4">
                      {/* Current photo display */}
                      {selectedMember?.photo && !photoRemoved && !uploadedFileUrl && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <img 
                              src={selectedMember.photo} 
                              alt={selectedMember.name}
                              className="w-12 h-12 object-cover rounded-md" 
                            />
                            <span className="text-sm font-medium truncate max-w-[180px]">
                              Current Photo
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemovePhoto}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Upload new photo */}
                      <FormControl>
                        <div className="space-y-4">
                          <UploadThingFileUpload
                            onUploadComplete={handleFileUploadComplete}
                            uploadType="imageUploader"
                            maxFiles={1}
                            maxFileSize={4}
                            allowedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                          />
                          
                          {/* New uploaded photo preview */}
                          {uploadedFileUrl && (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={uploadedFileUrl} 
                                  alt="Preview" 
                                  className="w-12 h-12 rounded-md object-cover" 
                                />
                                <span className="text-sm font-medium truncate max-w-[180px]">
                                  New Photo
                                </span>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={handleRemovePhoto}
                                className="shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                    </div>
                    <FormDescription>
                      Upload a new photo or remove the current one
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Display this team member on the website
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Team Member"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the team member "{selectedMember?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Team Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}