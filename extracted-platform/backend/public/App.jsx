import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import AIBuilderInterface from '@/components/AIBuilderInterface.jsx'
import IntegrationsInterface from '@/components/IntegrationsInterface.jsx'
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  Star, 
  Search, 
  Filter,
  Plus,
  Settings,
  BarChart3,
  Users,
  Globe,
  Smartphone,
  Mail,
  Facebook,
  MessageCircle,
  Download,
  Cloud,
  Play,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import './App.css'

// Main App Component
function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  
  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <Router>
      <div className={`min-h-screen bg-background text-foreground ${isDarkMode ? 'dark' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/builder" element={<ChatbotBuilder />} />
          <Route path="/ai-builder" element={<AIBuilder />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

// Landing Page Component
function LandingPage() {
  const [activeTab, setActiveTab] = useState('marketplace')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                BotFlo.ai
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#marketplace" className="text-gray-300 hover:text-white transition-colors">Marketplace</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                Sign In
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Build AI Chatbots
              <br />
              <span className="text-4xl md:text-6xl">Without Code</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Deploy production-ready chatbots in minutes with our marketplace of premade bots, 
              or create custom AI-powered solutions with our advanced no-code builder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-4">
                <Sparkles className="mr-2 h-5 w-5" />
                Explore Marketplace
              </Button>
              <Button size="lg" variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white text-lg px-8 py-4">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <Zap className="h-8 w-8 text-yellow-400 mb-2" />
                  <CardTitle className="text-white">Deploy in Minutes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Choose from our marketplace of ready-to-use chatbots and deploy instantly.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <Bot className="h-8 w-8 text-purple-400 mb-2" />
                  <CardTitle className="text-white">AI-Powered</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Advanced AI capabilities with natural language processing and learning.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <Globe className="h-8 w-8 text-blue-400 mb-2" />
                  <CardTitle className="text-white">Multi-Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Deploy across WhatsApp, Messenger, Email, and your website.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <section id="marketplace" className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready-to-Deploy Chatbots</h2>
            <p className="text-xl text-gray-300">Choose from our curated marketplace of industry-specific chatbots</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="builder">Visual Builder</TabsTrigger>
              <TabsTrigger value="ai">AI Builder</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="marketplace" className="mt-8">
              <MarketplacePreview />
            </TabsContent>
            
            <TabsContent value="builder" className="mt-8">
              <BuilderPreview />
            </TabsContent>
            
            <TabsContent value="ai" className="mt-8">
              <AIBuilderPreview />
            </TabsContent>
            
            <TabsContent value="integrations" className="mt-8">
              <IntegrationsPreview />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Build Your Chatbot?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of businesses using BotFlo.ai to automate customer engagement</p>
          <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-12 py-4">
            Start Building Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}

// Marketplace Preview Component
function MarketplacePreview() {
  const templates = [
    {
      id: 'restaurant-bot',
      name: 'Restaurant Bot',
      description: 'Handle orders, reservations, and menu inquiries',
      category: 'Restaurant',
      price: '$24',
      rating: 4.8,
      downloads: 1200,
      features: ['Order Taking', 'Menu Display', 'Reservations', 'Payment Integration']
    },
    {
      id: 'support-bot',
      name: 'Customer Support Bot',
      description: 'FAQ handling, ticket creation, and live agent escalation',
      category: 'Support',
      price: '$19',
      rating: 4.9,
      downloads: 2100,
      features: ['FAQ Handling', 'Ticket Creation', 'Live Chat', 'Knowledge Base']
    },
    {
      id: 'ecommerce-bot',
      name: 'E-commerce Assistant',
      description: 'Product discovery, recommendations, and order tracking',
      category: 'E-commerce',
      price: '$29',
      rating: 4.7,
      downloads: 890,
      features: ['Product Search', 'Recommendations', 'Cart Management', 'Order Tracking']
    }
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                {template.category}
              </Badge>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-300">{template.rating}</span>
              </div>
            </div>
            <CardTitle className="text-white">{template.name}</CardTitle>
            <CardDescription className="text-gray-300">{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {template.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {feature}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-white">{template.price}</span>
                  <span className="text-sm text-gray-400 ml-1">one-time</span>
                </div>
                <div className="text-sm text-gray-400">
                  {template.downloads} downloads
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Download className="mr-1 h-4 w-4" />
                  Buy Now
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Builder Preview Component
function BuilderPreview() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">Visual Drag & Drop Builder</h3>
        <p className="text-gray-300">Create custom chatbots with our intuitive visual interface</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Key Features:</h4>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              Drag & drop conversation flows
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              Real-time preview
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              Custom branding & themes
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              Integration management
            </li>
          </ul>
        </div>
        
        <div className="bg-black/30 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Builder Interface Preview</div>
          <div className="space-y-2">
            <div className="bg-purple-600/20 border border-purple-500/30 rounded p-2 text-sm text-purple-300">
              Welcome Message Block
            </div>
            <div className="bg-blue-600/20 border border-blue-500/30 rounded p-2 text-sm text-blue-300">
              Menu Options Block
            </div>
            <div className="bg-green-600/20 border border-green-500/30 rounded p-2 text-sm text-green-300">
              Response Handler Block
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// AI Builder Preview Component
function AIBuilderPreview() {
  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-lg p-8 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">
          <Sparkles className="inline h-6 w-6 text-purple-400 mr-2" />
          AI-Powered Chatbot Builder
        </h3>
        <p className="text-gray-300">Train custom AI models with your data for intelligent conversations</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-purple-500/20">
          <CardHeader>
            <Bot className="h-8 w-8 text-purple-400 mb-2" />
            <CardTitle className="text-white">Natural Language Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm">Advanced NLP capabilities for understanding user intent and context.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-purple-500/20">
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-green-400 mb-2" />
            <CardTitle className="text-white">Continuous Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm">AI models improve over time based on user interactions and feedback.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-purple-500/20">
          <CardHeader>
            <Settings className="h-8 w-8 text-blue-400 mb-2" />
            <CardTitle className="text-white">Custom Training</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm">Upload your own data to train specialized AI models for your business.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Integrations Preview Component
function IntegrationsPreview() {
  const integrations = [
    { name: 'WhatsApp Business', icon: MessageCircle, color: 'text-green-400' },
    { name: 'Facebook Messenger', icon: Facebook, color: 'text-blue-400' },
    { name: 'Email Automation', icon: Mail, color: 'text-red-400' },
    { name: 'Website Widget', icon: Globe, color: 'text-purple-400' },
    { name: 'Mobile Apps', icon: Smartphone, color: 'text-orange-400' },
    { name: 'Slack', icon: MessageSquare, color: 'text-yellow-400' }
  ]

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">Multi-Channel Deployment</h3>
        <p className="text-gray-300">Deploy your chatbots across all major messaging platforms</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.name} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <integration.icon className={`h-12 w-12 ${integration.color} mx-auto mb-3`} />
              <h4 className="text-white font-medium">{integration.name}</h4>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Dashboard Component (placeholder)
function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <p className="text-gray-300">Dashboard content coming soon...</p>
    </div>
  )
}

// Marketplace Component (placeholder)
function Marketplace() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Marketplace</h1>
      <p className="text-gray-300">Full marketplace coming soon...</p>
    </div>
  )
}

// Chatbot Builder Component (placeholder)
function ChatbotBuilder() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Chatbot Builder</h1>
      <p className="text-gray-300">Visual builder coming soon...</p>
    </div>
  )
}

// AI Builder Component (placeholder)
function AIBuilder() {
  return <AIBuilderInterface />
}

// Integrations Component
function Integrations() {
  return <IntegrationsInterface />
}

export default App

