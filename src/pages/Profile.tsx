
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ButtonCustom } from "@/components/ui/button-custom"
import { useState } from "react"

const StyleProfile = () => {
  // This is a simplified version - in a real app, you'd have more complex state management
  const [step, setStep] = useState(1)
  const totalSteps = 4
  
  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="fashion-heading text-3xl md:text-4xl mb-4">Create Your Style Profile</h1>
            <p className="fashion-subheading">
              Help us understand your preferences to create personalized recommendations
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="mb-12">
            <div className="flex justify-between mb-2">
              {Array.from({length: totalSteps}).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i + 1 <= step ? 'bg-fashion-accent text-white' : 'bg-fashion-light text-fashion-text/50'
                  }`}>
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative h-2 bg-fashion-light rounded-full">
              <div 
                className="absolute h-2 bg-fashion-accent rounded-full transition-all duration-500"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Step content */}
          <div className="glass-card p-6 md:p-8 animate-fade-in">
            {step === 1 && (
              <div>
                <h2 className="fashion-heading text-2xl mb-6">Basic Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-md border border-fashion-dark/20 focus:outline-none focus:ring-2 focus:ring-fashion-accent/50"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Gender</label>
                    <select className="w-full px-4 py-2 rounded-md border border-fashion-dark/20 focus:outline-none focus:ring-2 focus:ring-fashion-accent/50">
                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Age Range</label>
                    <select className="w-full px-4 py-2 rounded-md border border-fashion-dark/20 focus:outline-none focus:ring-2 focus:ring-fashion-accent/50">
                      <option value="">Select age range</option>
                      <option value="18-24">18-24</option>
                      <option value="25-34">25-34</option>
                      <option value="35-44">35-44</option>
                      <option value="45-54">45-54</option>
                      <option value="55+">55+</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div>
                <h2 className="fashion-heading text-2xl mb-6">Style Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Style Aesthetic (Select multiple)</label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {['Minimalist', 'Classic', 'Casual', 'Bohemian', 'Streetwear', 'Preppy', 'Vintage', 'Athletic', 'Formal'].map(style => (
                        <div key={style} className="flex items-center">
                          <input type="checkbox" id={style} className="mr-2" />
                          <label htmlFor={style} className="text-sm">{style}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Favorite Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {['Black', 'White', 'Gray', 'Navy', 'Beige', 'Brown', 'Red', 'Green', 'Blue', 'Purple', 'Pink', 'Yellow'].map(color => (
                        <div key={color} className="flex items-center">
                          <input type="checkbox" id={color} className="mr-1" />
                          <label htmlFor={color} className="text-sm">{color}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div>
                <h2 className="fashion-heading text-2xl mb-6">Body Shape & Fit Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Body Shape</label>
                    <select className="w-full px-4 py-2 rounded-md border border-fashion-dark/20 focus:outline-none focus:ring-2 focus:ring-fashion-accent/50">
                      <option value="">Select body shape</option>
                      <option value="hourglass">Hourglass</option>
                      <option value="pear">Pear</option>
                      <option value="apple">Apple</option>
                      <option value="rectangle">Rectangle</option>
                      <option value="inverted-triangle">Inverted Triangle</option>
                      <option value="athletic">Athletic</option>
                      <option value="not-sure">Not Sure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Fit Preference</label>
                    <div className="flex gap-4">
                      {['Loose', 'Regular', 'Fitted', 'Mix of fits'].map(fit => (
                        <div key={fit} className="flex items-center">
                          <input type="radio" name="fit" id={fit} className="mr-2" />
                          <label htmlFor={fit} className="text-sm">{fit}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Areas You Prefer to Highlight</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Arms', 'Legs', 'Waist', 'Shoulders', 'Back', 'None specific'].map(area => (
                        <div key={area} className="flex items-center">
                          <input type="checkbox" id={area} className="mr-2" />
                          <label htmlFor={area} className="text-sm">{area}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div>
                <h2 className="fashion-heading text-2xl mb-6">Style Goals</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">What are your fashion goals?</label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        'Develop a signature style', 
                        'Update my wardrobe for a new season', 
                        'Find outfits for specific occasions',
                        'Dress more confidently',
                        'Experiment with new trends',
                        'Create a capsule wardrobe'
                      ].map(goal => (
                        <div key={goal} className="flex items-center">
                          <input type="checkbox" id={goal} className="mr-2" />
                          <label htmlFor={goal} className="text-sm">{goal}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Any specific fashion challenges?</label>
                    <textarea 
                      className="w-full px-4 py-2 rounded-md border border-fashion-dark/20 focus:outline-none focus:ring-2 focus:ring-fashion-accent/50"
                      rows={4}
                      placeholder="Tell us about any specific challenges you face with your style..."
                    ></textarea>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <ButtonCustom variant="outline" className="rounded-full" onClick={prevStep}>
                Back
              </ButtonCustom>
            ) : (
              <div></div>
            )}
            
            {step < totalSteps ? (
              <ButtonCustom variant="accent" className="rounded-full" onClick={nextStep}>
                Continue
              </ButtonCustom>
            ) : (
              <ButtonCustom variant="accent" className="rounded-full">
                Complete Profile
              </ButtonCustom>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default StyleProfile
