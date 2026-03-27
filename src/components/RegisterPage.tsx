import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export function RegisterPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted");
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header section with navy background */}
      <div className="bg-[#001f3f] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl text-white mb-4">
            Register for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Gator Quant Hackathon</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Join 500+ students for 48 hours of quantitative innovation
          </p>
        </div>
      </div>

      {/* Form section */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-[#001f3f] p-8 rounded-lg border border-gray-800">
            <h2 className="text-2xl text-white mb-6">Personal Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  className="bg-black border-gray-700 text-white focus:border-cyan-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  className="bg-black border-gray-700 text-white focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="email" className="text-white">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                className="bg-black border-gray-700 text-white focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="phone" className="text-white">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                required
                className="bg-black border-gray-700 text-white focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-[#001f3f] p-8 rounded-lg border border-gray-800">
            <h2 className="text-2xl text-white mb-6">Academic Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="university" className="text-white">University *</Label>
              <Input
                id="university"
                required
                className="bg-black border-gray-700 text-white focus:border-cyan-400"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="major" className="text-white">Major *</Label>
                <Input
                  id="major"
                  required
                  className="bg-black border-gray-700 text-white focus:border-cyan-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year" className="text-white">Year of Study *</Label>
                <select
                  id="year"
                  required
                  className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="">Select year</option>
                  <option value="freshman">Freshman</option>
                  <option value="sophomore">Sophomore</option>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="graduate">Graduate Student</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="graduationYear" className="text-white">Expected Graduation Year *</Label>
              <Input
                id="graduationYear"
                type="number"
                min="2024"
                max="2030"
                required
                className="bg-black border-gray-700 text-white focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Experience & Links */}
          <div className="bg-[#001f3f] p-8 rounded-lg border border-gray-800">
            <h2 className="text-2xl text-white mb-6">Experience & Links</h2>
            
            <div className="space-y-2">
              <Label htmlFor="github" className="text-white">GitHub Profile</Label>
              <Input
                id="github"
                type="url"
                placeholder="https://github.com/username"
                className="bg-black border-gray-700 text-white focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="linkedin" className="text-white">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/username"
                className="bg-black border-gray-700 text-white focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="resume" className="text-white">Resume/CV</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                className="bg-black border-gray-700 text-white focus:border-cyan-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-cyan-400 file:text-[#001f3f] file:cursor-pointer hover:file:bg-cyan-300"
              />
            </div>
          </div>

          {/* Short Answer Questions */}
          <div className="bg-[#001f3f] p-8 rounded-lg border border-gray-800">
            <h2 className="text-2xl text-white mb-6">Tell Us About Yourself</h2>
            
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-white">
                What experience do you have with quantitative finance or data science? *
              </Label>
              <Textarea
                id="experience"
                required
                rows={4}
                className="bg-black border-gray-700 text-white focus:border-cyan-400 resize-none"
                placeholder="Tell us about your background..."
              />
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="motivation" className="text-white">
                Why do you want to participate in Gator Quant Hackathon? *
              </Label>
              <Textarea
                id="motivation"
                required
                rows={4}
                className="bg-black border-gray-700 text-white focus:border-cyan-400 resize-none"
                placeholder="What excites you about this event?"
              />
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="project" className="text-white">
                Describe a project you're proud of (technical or otherwise)
              </Label>
              <Textarea
                id="project"
                rows={4}
                className="bg-black border-gray-700 text-white focus:border-cyan-400 resize-none"
                placeholder="Share your accomplishments..."
              />
            </div>
          </div>

          {/* Logistics */}
          <div className="bg-[#001f3f] p-8 rounded-lg border border-gray-800">
            <h2 className="text-2xl text-white mb-6">Logistics</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="dietary"
                  className="mt-1 w-4 h-4 bg-black border-gray-700 rounded focus:ring-cyan-400"
                />
                <div>
                  <Label htmlFor="dietary" className="text-white">
                    I have dietary restrictions
                  </Label>
                  <Input
                    id="dietaryDetails"
                    placeholder="Please specify..."
                    className="bg-black border-gray-700 text-white focus:border-cyan-400 mt-2"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="travel"
                  className="mt-1 w-4 h-4 bg-black border-gray-700 rounded focus:ring-cyan-400"
                />
                <Label htmlFor="travel" className="text-white">
                  I will need travel reimbursement
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="firstHackathon"
                  className="mt-1 w-4 h-4 bg-black border-gray-700 rounded focus:ring-cyan-400"
                />
                <Label htmlFor="firstHackathon" className="text-white">
                  This is my first hackathon
                </Label>
              </div>
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="bg-[#001f3f] p-8 rounded-lg border border-gray-800">
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 bg-black border-gray-700 rounded focus:ring-cyan-400"
              />
              <Label htmlFor="terms" className="text-white">
                I agree to the MLH Code of Conduct and authorize you to share my application/registration information with Major League Hacking for event administration, ranking, and MLH administration in-line with the MLH Privacy Policy. *
              </Label>
            </div>

            <Button 
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 text-[#001f3f] hover:from-blue-500 hover:to-cyan-500 text-lg py-6"
            >
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}