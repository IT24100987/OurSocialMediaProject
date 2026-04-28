import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MdCheckCircle, MdRocketLaunch, MdPerson, MdTrendingUp, MdPeople, MdAnalytics, MdSecurity, MdSpeed, MdSupport, MdStar } from 'react-icons/md';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d()\-\s]{7,20}$/;
const MIN_PASSWORD_LENGTH = 8;
const VALID_PACKAGES = ['Silver', 'Gold', 'Platinum', 'Diamond'];

const LandingPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    package: 'Silver',
    password: '',
  });

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateRegistrationForm = () => {
    const trimmedName = formData.name.trim();
    const normalizedEmail = formData.email.trim().toLowerCase();
    const trimmedPhone = formData.phone.trim();
    const trimmedCompany = formData.company.trim();
    const nextErrors = {};

    if (!trimmedName) {
      nextErrors.name = 'Full name is required';
    }

    if (!normalizedEmail) {
      nextErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
      nextErrors.phone = 'Please enter a valid phone number';
    }

    if (!VALID_PACKAGES.includes(formData.package)) {
      nextErrors.package = 'Please select a valid package';
    }

    setFieldErrors(nextErrors);
    return {
      isValid: Object.keys(nextErrors).length === 0,
      payload: {
        ...formData,
        name: trimmedName,
        email: normalizedEmail,
        phone: trimmedPhone,
        company: trimmedCompany,
      },
    };
  };

  // Handle Register Form Submit
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    const { isValid, payload } = validateRegistrationForm();
    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      // 💡 Beginner Note: This hits the backend route we created: POST /api/clients/register
      const { data } = await api.post('/clients/register', payload);
      
      setSuccessMsg('Registration successful! Redirecting to your dashboard...');
      
      // Auto-log them in using AuthContext and the returned token
      setTimeout(() => {
        login({ _id: data._id, name: data.name, email: data.email, role: data.role }, data.token);
        navigate('/client');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans overflow-x-hidden">
      
      {/* 🔴 HEADER */}
      <header className="bg-white shadow-sm py-4 px-6 md:px-8 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-2 text-blue-600">
          <MdRocketLaunch size={28} />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">SpotOn CMS</h1>
        </div>
        <div>
          <button 
            onClick={() => navigate('/login')}
            className="text-slate-600 hover:text-blue-600 font-medium px-4 py-2 transition-colors flex items-center space-x-2 hover:bg-blue-50 rounded-lg"
          >
            <MdPerson size={20} />
            <span className="hidden sm:inline">Login</span>
          </button>
        </div>
      </header>

      {/* 🔴 HERO SECTION */}
      <section className="pt-32 pb-20 px-4 md:px-8 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Intelligent Client <span className="text-blue-600">Engagement</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            The all-in-one management system designed to elevate your business. Predict trends, analyze feedback with AI, and manage tasks effortlessly.
          </p>
          <button 
            onClick={() => document.getElementById('register').scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* 🔴 STATISTICS */}
      <section className="py-16 px-4 md:px-8 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {[
              { number: "10,000+", label: "Active Users", icon: <MdPeople size={28} /> },
              { number: "95%", label: "Client Satisfaction", icon: <MdStar size={28} /> },
              { number: "500K+", label: "Tasks Managed", icon: <MdAnalytics size={28} /> },
              { number: "24/7", label: "AI Support", icon: <MdSupport size={28} /> }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-3 p-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <div className="text-3xl md:text-4xl text-blue-100">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold">{stat.number}</div>
                <div className="text-blue-100 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔴 ENHANCED FEATURES */}
      <section className="py-24 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800">Powerful Features</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto px-4">
            Everything you need to manage your business effectively
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { 
                title: "AI-Powered Insights", 
                desc: "Automatically analyze sentiment and detect trends from your client feedback with advanced machine learning.",
                icon: <MdAnalytics size={32} />,
                color: "blue"
              },
              { 
                title: "Automated Tasking", 
                desc: "Keep your staff synchronized with intuitive team calendar management and smart task assignments.",
                icon: <MdSpeed size={32} />,
                color: "green"
              },
              { 
                title: "Beautiful Analytics", 
                desc: "Track campaign reach, engagement, and conversions instantly with real-time dashboards.",
                icon: <MdTrendingUp size={32} />,
                color: "purple"
              },
              { 
                title: "Enterprise Security", 
                desc: "Bank-level security with encrypted data storage and secure user authentication.",
                icon: <MdSecurity size={32} />,
                color: "red"
              },
              { 
                title: "24/7 Support", 
                desc: "Get help whenever you need it with our dedicated support team and AI assistant.",
                icon: <MdSupport size={32} />,
                color: "yellow"
              },
              { 
                title: "Team Collaboration", 
                desc: "Work together seamlessly with role-based access and real-time updates.",
                icon: <MdPeople size={32} />,
                color: "indigo"
              }
            ].map((feat, idx) => (
              <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:border-blue-300 hover:-translate-y-2 cursor-pointer group">
                 <div className={`w-14 h-14 md:w-16 md:h-16 bg-${feat.color}-100 text-${feat.color}-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    {feat.icon}
                 </div>
                 <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4">{feat.title}</h3>
                 <p className="text-slate-600 leading-relaxed text-sm md:text-base">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔴 TESTIMONIALS */}
      <section className="py-24 px-4 md:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-800">What Our Clients Say</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto px-4">
            Don't just take our word for it - hear from businesses like yours
          </p>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "CEO, TechStart Inc",
                content: "SpotOn CMS transformed how we manage client relationships. The AI insights alone saved us hours of work each week.",
                rating: 5,
                avatar: "SJ"
              },
              {
                name: "Michael Chen",
                role: "Marketing Director, FoodBox",
                content: "The analytics dashboard is incredible. We can now track campaign performance in real-time and make data-driven decisions.",
                rating: 5,
                avatar: "MC"
              },
              {
                name: "Emily Rodriguez",
                role: "Operations Manager, GreenLife",
                content: "Task management has never been easier. Our team productivity increased by 40% within the first month.",
                rating: 5,
                avatar: "ER"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <MdStar key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic text-sm md:text-base">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔴 CALL TO ACTION */}
      <section className="py-24 px-4 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-lg md:text-xl mb-8 text-blue-100 px-4">
            Join thousands of successful businesses using SpotOn CMS to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('register').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-blue-50 transition-colors transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
            >
              Login to Demo
            </button>
          </div>
        </div>
      </section>

      {/* 🔴 ENHANCED PACKAGE PRICING */}
      <section className="bg-slate-900 py-24 px-4 md:px-8 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Choose Your Plan</h2>
          <p className="text-center text-slate-300 mb-16 max-w-2xl mx-auto px-4">
            Flexible pricing options designed for businesses of all sizes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               {
                 name: 'Silver',
                 price: '$99',
                 features: ['Up to 100 clients', 'Basic analytics', 'Email support', '5GB storage'],
                 color: 'slate'
               },
               {
                 name: 'Gold', 
                 price: '$299',
                 features: ['Up to 500 clients', 'Advanced analytics', 'Priority support', '50GB storage', 'AI insights'],
                 color: 'yellow'
               },
               {
                 name: 'Platinum',
                 price: '$599', 
                 features: ['Unlimited clients', 'Real-time analytics', '24/7 phone support', '200GB storage', 'Advanced AI', 'Custom integrations'],
                 color: 'indigo'
               },
               {
                 name: 'Diamond',
                 price: 'Custom',
                 features: ['Everything in Platinum', 'Dedicated account manager', 'Unlimited storage', 'Custom features', 'SLA guarantee'],
                 color: 'cyan',
                 popular: true
               }
             ].map((plan, idx) => (
                 <div key={plan.name} className={`p-6 md:p-8 rounded-2xl border text-center flex flex-col justify-between transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
                   plan.popular ? 'border-cyan-400 bg-slate-800 shadow-lg shadow-cyan-400/20' : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                 }`}>
                     {plan.popular && (
                       <div className="bg-cyan-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full mb-4">
                         MOST POPULAR
                       </div>
                     )}
                     <div>
                       <h3 className={`text-xl md:text-2xl font-bold mb-2 ${
                         plan.color === 'slate' ? 'text-slate-400' :
                         plan.color === 'yellow' ? 'text-yellow-400' :
                         plan.color === 'indigo' ? 'text-indigo-400' : 'text-cyan-400'
                       }`}>{plan.name}</h3>
                       <div className="text-3xl md:text-4xl font-bold mb-6">{plan.price}</div>
                       <div className="text-slate-300 mb-6 font-medium text-sm border-b border-slate-700 pb-4">
                         {plan.name === 'Diamond' ? 'Enterprise Solution' : 'Per Month'}
                       </div>
                       <ul className="text-left space-y-3 mb-8">
                         {plan.features.map((feature, i) => (
                           <li key={i} className="flex items-start space-x-2">
                             <MdCheckCircle size={16} className="text-green-400 mt-1 flex-shrink-0" />
                             <span className="text-slate-300 text-sm">{feature}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                     <button 
                       onClick={() => {
                          setFormData(prev => ({ ...prev, package: plan.name }));
                          document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
                       }}
                       className={`mt-6 py-3 px-4 rounded-full font-bold text-sm transition-all transform hover:scale-105 ${
                         plan.popular ? 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg' : 'bg-slate-700 text-white hover:bg-slate-600'
                       }`}
                     >
                       Get Started
                     </button>
                 </div>
             ))}
          </div>
        </div>
      </section>

      {/* 🔴 REGISTRATION FORM */}
      <section id="register" className="py-24 px-4 md:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">Get Started Today</h2>
            <p className="text-slate-600 text-lg">Join thousands of businesses using SpotOn CMS</p>
          </div>
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100">
             <h3 className="text-xl md:text-2xl font-bold text-slate-800 text-center mb-8">Client Registration</h3>
             
             {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 text-sm font-medium">
                  {error}
                </div>
             )}
             {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200 text-sm font-medium flex items-center space-x-2">
                  <MdCheckCircle size={20} />
                  <span>{successMsg}</span>
                </div>
             )}

             <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
                     <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="John Doe" />
                    {fieldErrors.name && <p className="text-red-600 text-xs mt-2 font-medium">{fieldErrors.name}</p>}
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-600 mb-2">Company</label>
                     <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Tech Inc" />
                  </div>
                </div>

              <div>
                 <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
                 <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="john@example.com" />
                  {fieldErrors.email && <p className="text-red-600 text-xs mt-2 font-medium">{fieldErrors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="+1..." />
                  {fieldErrors.phone && <p className="text-red-600 text-xs mt-2 font-medium">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Package</label>
                  <select name="package" value={formData.package} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer font-medium text-slate-700">
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Diamond">Diamond</option>
                  </select>
                  {fieldErrors.package && <p className="text-red-600 text-xs mt-2 font-medium">{fieldErrors.package}</p>}
                </div>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
                 <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="••••••••" />
                  {fieldErrors.password && <p className="text-red-600 text-xs mt-2 font-medium">{fieldErrors.password}</p>}
              </div>

              <button 
                 type="submit" 
                 disabled={isLoading || successMsg !== ''}
                 className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                   isLoading || successMsg 
                     ? 'bg-slate-400 text-slate-200 cursor-not-allowed' 
                     : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                 }`}
               >
                 {isLoading ? 'Creating Account...' : successMsg ? '✅ Account Created!' : 'Create Account'}
               </button>
            </form>
          </div>
        </div>
      </section>

      {/* 🔴 COMPREHENSIVE FOOTER */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 text-blue-400 mb-4">
                <MdRocketLaunch size={28} />
                <h3 className="text-xl font-bold text-white">SpotOn CMS</h3>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Intelligent Client Engagement Management System designed to transform your business operations with AI-powered insights.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Facebook</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Twitter</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">LinkedIn</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Instagram</a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">AI Integration</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API Docs</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Partners</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} SpotOn CMS. All rights reserved.
            </div>
            <div className="text-sm text-slate-400 mt-4 md:mt-0">
              Made with ❤️ for businesses worldwide
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
