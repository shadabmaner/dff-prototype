// Script to create Mindset Coach credential
// This script demonstrates how to create a mindset coach staff member via API

const mindsetCoachData = {
  role_id: "mindset-coach-role-id", // This would need to be the actual role ID from your database
  first_name: "Mindset",
  last_name: "Coach",
  email: "mindset@drap.com",
  phone: "9876543210",
  password: "strongP@SS1",
  specialization: "Mindset Coaching",
  qualification: "Certified Mindset Coach",
  experience_years: 5,
  bio: "Specialized in mindset coaching, meditation, and mental wellness activities.",
  languages: ["English", "Hindi"],
  address: "123 Wellness Street",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  pincode: "400001"
};

// API endpoint to create staff
const API_ENDPOINT = "/clinical/staff";

// This would be called via the API client in the actual application
console.log("Mindset Coach Credential Created:");
console.log("Email: mindset@drap.com");
console.log("Password: strongP@SS1");
console.log("\nTo create this staff member, make a POST request to:");
console.log(`${API_ENDPOINT}`);
console.log("With the following payload:");
console.log(JSON.stringify(mindsetCoachData, null, 2));
