'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface PhysiotherapistProfile {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  licenseNumber: string
  experience: number
  qualifications: string[]
  bio: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  joinDate: string
  profileImage?: string
  department: string
  languages: string[]
  availability: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
}

interface ProfileForm {
  name: string
  email: string
  phone: string
  specialization: string
  bio: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const mockProfile: PhysiotherapistProfile = {
  id: '1',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@hospital.com',
  phone: '+1 (555) 123-4567',
  specialization: 'Orthopedic and Sports Physiotherapy',
  licenseNumber: 'PT-2021-NY-0456',
  experience: 8,
  qualifications: [
    'Doctor of Physical Therapy (DPT) - New York University',
    'Bachelor of Science in Exercise Science - Columbia University',
    'Certified Orthopedic Specialist (OCS)',
    'Certified Strength and Conditioning Specialist (CSCS)'
  ],
  bio: 'Dr. Sarah Johnson is a dedicated physiotherapist with over 8 years of experience in orthopedic and sports rehabilitation. She specializes in post-operative care, sports injuries, and musculoskeletal disorders. Sarah is passionate about helping patients regain their mobility and improve their quality of life through evidence-based treatment approaches.',
  address: '123 Medical Center Drive',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'United States',
  joinDate: '2021-03-15',
  department: 'Physical Therapy Department',
  languages: ['English', 'Spanish', 'French'],
  availability: {
    monday: '9:00 AM - 6:00 PM',
    tuesday: '9:00 AM - 6:00 PM',
    wednesday: '9:00 AM - 6:00 PM',
    thursday: '9:00 AM - 6:00 PM',
    friday: '9:00 AM - 4:00 PM',
    saturday: 'Closed',
    sunday: 'Closed'
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<PhysiotherapistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ProfileForm>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('physio_token')
    if (!token) {
      router.push('/physiotherapist/login')
      return
    }

    loadProfile()
  }, [router])

  const loadProfile = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProfile(mockProfile)
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone,
        specialization: mockProfile.specialization,
        bio: mockProfile.bio,
        address: mockProfile.address,
        city: mockProfile.city,
        state: mockProfile.state,
        zipCode: mockProfile.zipCode,
        country: mockProfile.country
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        specialization: profile.specialization,
        bio: profile.bio,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        country: profile.country
      })
    }
  }

  const handleSaveProfile = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (profile) {
        setProfile(prev => prev ? { ...prev, ...formData } : null)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {}

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real app, this would update the password
      setIsPasswordDialogOpen(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordErrors({})
      
      // Show success message (in real app, you'd use a toast)
      alert('Password changed successfully!')
    } catch (error) {
      console.error('Failed to change password:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and account settings</p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button onClick={handleEditProfile}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Image and Basic Info */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <Button variant="outline" size="sm" className="mt-4" disabled={isEditing}>
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              </CardHeader>
              <CardContent className="text-center">
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                <p className="text-gray-600">{profile.specialization}</p>
                <Badge variant="outline" className="mt-2">{profile.department}</Badge>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Joined {profile.joinDate}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span>{profile.experience} years experience</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    disabled={!isEditing}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">License Number</Label>
                  <p className="text-gray-700">{profile.licenseNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-gray-700">{profile.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Years of Experience</Label>
                  <p className="text-gray-700">{profile.experience} years</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Languages</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.languages.map((language) => (
                      <Badge key={language} variant="outline">{language}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {profile.qualifications.map((qualification, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Award className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{qualification}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>
                Your regular working hours for patient consultations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(profile.availability).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium capitalize">{day}</span>
                    <span className={`text-sm ${hours === 'Closed' ? 'text-red-600' : 'text-green-600'}`}>
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                </div>
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <Button variant="outline" disabled>
                  Enable 2FA
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Login Activity</h4>
                  <p className="text-sm text-gray-600">View your recent login history</p>
                </div>
                <Button variant="outline" disabled>
                  View Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-600">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-600">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsPasswordDialogOpen(false)
                setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                })
                setPasswordErrors({})
              }}>
                Cancel
              </Button>
              <Button onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
