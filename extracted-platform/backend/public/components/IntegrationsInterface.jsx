import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  MessageCircle, 
  Facebook, 
  Mail, 
  Globe, 
  Smartphone, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Save,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  Database,
  Cpu,
  Activity,
  Link,
  QrCode,
  Code,
  Webhook,
  Key,
  Shield,
  Zap,
  Users,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Send,
  Copy,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react'

export default function IntegrationsInterface() {
  const [activeTab, setActiveTab] = useState('whatsapp')
  const [integrations, setIntegrations] = useState({
    whatsapp: { connected: false, status: 'disconnected', messages: 0 },
    facebook: { connected: false, status: 'disconnected', messages: 0 },
    email: { connected: true, status: 'connected', messages: 1250 },
    website: { connected: true, status: 'connected', messages: 890 }
  })

  const [whatsappConfig, setWhatsappConfig] = useState({
    phoneNumber: '',
    businessName: '',
    webhookUrl: '',
    accessToken: '',
    verifyToken: '',
    autoReply: true,
    businessHours: true,
    welcomeMessage: 'Hello! How can I help you today?'
  })

  const [facebookConfig, setFacebookConfig] = useState({
    pageId: '',
    appId: '',
    pageAccessToken: '',
    appSecret: '',
    webhookUrl: '',
    autoReply: true,
    persistentMenu: true,
    getStartedButton: true
  })

  const [emailConfig, setEmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    autoReply: true,
    signature: ''
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Multi-Channel Integrations</h1>
              <p className="text-gray-300">Connect your chatbot to WhatsApp, Facebook Messenger, Email, and more</p>
            </div>
          </div>
          
          {/* Integration Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm text-gray-400">WhatsApp</p>
                      <p className="text-lg font-bold text-white">{integrations.whatsapp.messages}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {integrations.whatsapp.connected ? (
                      <Wifi className="h-4 w-4 text-green-400" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Facebook className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">Facebook</p>
                      <p className="text-lg font-bold text-white">{integrations.facebook.messages}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {integrations.facebook.connected ? (
                      <Wifi className="h-4 w-4 text-green-400" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-lg font-bold text-white">{integrations.email.messages}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {integrations.email.connected ? (
                      <Wifi className="h-4 w-4 text-green-400" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-400">Website</p>
                      <p className="text-lg font-bold text-white">{integrations.website.messages}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {integrations.website.connected ? (
                      <Wifi className="h-4 w-4 text-green-400" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 mb-6">
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          {/* WhatsApp Integration */}
          <TabsContent value="whatsapp" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5 text-green-400" />
                    WhatsApp Business API
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Connect your chatbot to WhatsApp Business API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Business Phone Number</Label>
                    <Input
                      value={whatsappConfig.phoneNumber}
                      onChange={(e) => setWhatsappConfig({...whatsappConfig, phoneNumber: e.target.value})}
                      placeholder="+1234567890"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">Business Name</Label>
                    <Input
                      value={whatsappConfig.businessName}
                      onChange={(e) => setWhatsappConfig({...whatsappConfig, businessName: e.target.value})}
                      placeholder="Your Business Name"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Access Token</Label>
                    <Input
                      type="password"
                      value={whatsappConfig.accessToken}
                      onChange={(e) => setWhatsappConfig({...whatsappConfig, accessToken: e.target.value})}
                      placeholder="Your WhatsApp Access Token"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Webhook URL</Label>
                    <Input
                      value={whatsappConfig.webhookUrl}
                      onChange={(e) => setWhatsappConfig({...whatsappConfig, webhookUrl: e.target.value})}
                      placeholder="https://your-domain.com/webhook"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Auto Reply</Label>
                      <Switch
                        checked={whatsappConfig.autoReply}
                        onCheckedChange={(checked) => setWhatsappConfig({...whatsappConfig, autoReply: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Business Hours Only</Label>
                      <Switch
                        checked={whatsappConfig.businessHours}
                        onCheckedChange={(checked) => setWhatsappConfig({...whatsappConfig, businessHours: checked})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Configuration & Testing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Welcome Message</Label>
                    <Textarea
                      value={whatsappConfig.welcomeMessage}
                      onChange={(e) => setWhatsappConfig({...whatsappConfig, welcomeMessage: e.target.value})}
                      placeholder="Welcome message for new users"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Connection Status</span>
                        <Badge variant={integrations.whatsapp.connected ? 'secondary' : 'destructive'}>
                          {integrations.whatsapp.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        {integrations.whatsapp.connected 
                          ? 'Your WhatsApp integration is active and receiving messages'
                          : 'Configure your settings and test the connection'
                        }
                      </p>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      onClick={() => setIntegrations({...integrations, whatsapp: {...integrations.whatsapp, connected: !integrations.whatsapp.connected}})}
                    >
                      {integrations.whatsapp.connected ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </Button>

                    <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Setup Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                        <h3 className="text-white font-medium">Create Business Account</h3>
                      </div>
                      <p className="text-sm text-gray-400">Set up your WhatsApp Business account and get verified</p>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                        <h3 className="text-white font-medium">Get API Access</h3>
                      </div>
                      <p className="text-sm text-gray-400">Apply for WhatsApp Business API access through Meta</p>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                        <h3 className="text-white font-medium">Configure Webhook</h3>
                      </div>
                      <p className="text-sm text-gray-400">Set up webhook URL and verify your integration</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facebook Integration */}
          <TabsContent value="facebook" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Facebook className="mr-2 h-5 w-5 text-blue-400" />
                    Facebook Messenger
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Connect your chatbot to Facebook Messenger
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Facebook Page ID</Label>
                    <Input
                      value={facebookConfig.pageId}
                      onChange={(e) => setFacebookConfig({...facebookConfig, pageId: e.target.value})}
                      placeholder="Your Facebook Page ID"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">App ID</Label>
                    <Input
                      value={facebookConfig.appId}
                      onChange={(e) => setFacebookConfig({...facebookConfig, appId: e.target.value})}
                      placeholder="Your Facebook App ID"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Page Access Token</Label>
                    <Input
                      type="password"
                      value={facebookConfig.pageAccessToken}
                      onChange={(e) => setFacebookConfig({...facebookConfig, pageAccessToken: e.target.value})}
                      placeholder="Your Page Access Token"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">App Secret</Label>
                    <Input
                      type="password"
                      value={facebookConfig.appSecret}
                      onChange={(e) => setFacebookConfig({...facebookConfig, appSecret: e.target.value})}
                      placeholder="Your App Secret"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Auto Reply</Label>
                      <Switch
                        checked={facebookConfig.autoReply}
                        onCheckedChange={(checked) => setFacebookConfig({...facebookConfig, autoReply: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Persistent Menu</Label>
                      <Switch
                        checked={facebookConfig.persistentMenu}
                        onCheckedChange={(checked) => setFacebookConfig({...facebookConfig, persistentMenu: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Get Started Button</Label>
                      <Switch
                        checked={facebookConfig.getStartedButton}
                        onCheckedChange={(checked) => setFacebookConfig({...facebookConfig, getStartedButton: checked})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Messenger Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Connection Status</span>
                        <Badge variant={integrations.facebook.connected ? 'secondary' : 'destructive'}>
                          {integrations.facebook.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        {integrations.facebook.connected 
                          ? 'Your Facebook Messenger integration is active'
                          : 'Configure your settings and test the connection'
                        }
                      </p>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      onClick={() => setIntegrations({...integrations, facebook: {...integrations.facebook, connected: !integrations.facebook.connected}})}
                    >
                      {integrations.facebook.connected ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </Button>

                    <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Facebook Developer Console
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Available Features</h4>
                    <div className="space-y-2">
                      {[
                        'Rich Media Messages',
                        'Quick Replies',
                        'Persistent Menu',
                        'Get Started Button',
                        'Greeting Text',
                        'Postback Events'
                      ].map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Integration */}
          <TabsContent value="email" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Mail className="mr-2 h-5 w-5 text-purple-400" />
                    Email Integration
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Connect your chatbot to email for automated responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">SMTP Host</Label>
                    <Input
                      value={emailConfig.smtpHost}
                      onChange={(e) => setEmailConfig({...emailConfig, smtpHost: e.target.value})}
                      placeholder="smtp.gmail.com"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">SMTP Port</Label>
                    <Input
                      value={emailConfig.smtpPort}
                      onChange={(e) => setEmailConfig({...emailConfig, smtpPort: e.target.value})}
                      placeholder="587"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Username</Label>
                    <Input
                      value={emailConfig.username}
                      onChange={(e) => setEmailConfig({...emailConfig, username: e.target.value})}
                      placeholder="your-email@gmail.com"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Password</Label>
                    <Input
                      type="password"
                      value={emailConfig.password}
                      onChange={(e) => setEmailConfig({...emailConfig, password: e.target.value})}
                      placeholder="Your email password or app password"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">From Email</Label>
                    <Input
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig({...emailConfig, fromEmail: e.target.value})}
                      placeholder="noreply@yourdomain.com"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">From Name</Label>
                    <Input
                      value={emailConfig.fromName}
                      onChange={(e) => setEmailConfig({...emailConfig, fromName: e.target.value})}
                      placeholder="Your Business Name"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Email Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Email Signature</Label>
                    <Textarea
                      value={emailConfig.signature}
                      onChange={(e) => setEmailConfig({...emailConfig, signature: e.target.value})}
                      placeholder="Best regards,\nYour Business Name\nwww.yourdomain.com"
                      className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Auto Reply</Label>
                    <Switch
                      checked={emailConfig.autoReply}
                      onCheckedChange={(checked) => setEmailConfig({...emailConfig, autoReply: checked})}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Connection Status</span>
                        <Badge variant={integrations.email.connected ? 'secondary' : 'destructive'}>
                          {integrations.email.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        {integrations.email.connected 
                          ? 'Your email integration is active and processing messages'
                          : 'Configure your SMTP settings and test the connection'
                        }
                      </p>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => setIntegrations({...integrations, email: {...integrations.email, connected: !integrations.email.connected}})}
                    >
                      {integrations.email.connected ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </Button>

                    <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Website Integration */}
          <TabsContent value="website" className="space-y-6">
            <WebsiteIntegration />
          </TabsContent>

          {/* Deployment */}
          <TabsContent value="deployment" className="space-y-6">
            <DeploymentOptions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Website Integration Component
function WebsiteIntegration() {
  const [embedCode, setEmbedCode] = useState(`<script src="https://botflo.ai/embed.js"></script>
<script>
  BotFlo.init({
    botId: 'your-bot-id',
    theme: 'dark',
    position: 'bottom-right',
    primaryColor: '#8b5cf6',
    welcomeMessage: 'Hello! How can I help you today?'
  });
</script>`)

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="mr-2 h-5 w-5 text-yellow-400" />
              Website Embed
            </CardTitle>
            <CardDescription className="text-gray-300">
              Add your chatbot to any website with a simple embed code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Embed Code</Label>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                <pre className="text-green-400 whitespace-pre-wrap">{embedCode}</pre>
              </div>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Customization Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Position</Label>
              <Select defaultValue="bottom-right">
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Theme</Label>
              <Select defaultValue="dark">
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Primary Color</Label>
              <Input
                type="color"
                defaultValue="#8b5cf6"
                className="bg-white/5 border-white/10 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Welcome Message</Label>
              <Input
                defaultValue="Hello! How can I help you today?"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Website Integration Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-white mb-1">890</div>
              <div className="text-sm text-gray-400">Total Conversations</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-white mb-1">67%</div>
              <div className="text-sm text-gray-400">Engagement Rate</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-white mb-1">2.3s</div>
              <div className="text-sm text-gray-400">Avg Response Time</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <div className="text-2xl font-bold text-white mb-1">4.6/5</div>
              <div className="text-sm text-gray-400">User Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Deployment Options Component
function DeploymentOptions() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Download className="mr-2 h-5 w-5 text-blue-400" />
              Self-Hosted
            </CardTitle>
            <CardDescription className="text-gray-300">
              Download and deploy on your own infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Full control over data</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Custom modifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">No monthly fees</span>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Download className="mr-2 h-4 w-4" />
              Download Package
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="mr-2 h-5 w-5 text-green-400" />
              Cloud Hosted
            </CardTitle>
            <CardDescription className="text-gray-300">
              Deploy instantly to our managed cloud infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Instant deployment</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Auto-scaling</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">24/7 monitoring</span>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
              <Zap className="mr-2 h-4 w-4" />
              Deploy to Cloud
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Code className="mr-2 h-5 w-5 text-purple-400" />
              API Access
            </CardTitle>
            <CardDescription className="text-gray-300">
              Integrate with your existing systems via API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">RESTful API</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Webhook support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Custom integrations</span>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Code className="mr-2 h-4 w-4" />
              Get API Keys
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Deployment Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium">Active Deployments</h4>
              <div className="space-y-3">
                {[
                  { name: 'Production Bot', type: 'Cloud', status: 'Active', uptime: '99.9%' },
                  { name: 'Development Bot', type: 'Self-hosted', status: 'Active', uptime: '98.5%' },
                  { name: 'Staging Bot', type: 'Cloud', status: 'Inactive', uptime: '95.2%' }
                ].map((deployment) => (
                  <div key={deployment.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{deployment.name}</p>
                      <p className="text-sm text-gray-400">{deployment.type}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={deployment.status === 'Active' ? 'secondary' : 'outline'}>
                        {deployment.status}
                      </Badge>
                      <p className="text-sm text-gray-400 mt-1">{deployment.uptime} uptime</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-medium">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <div className="text-xl font-bold text-white">99.9%</div>
                  <div className="text-xs text-gray-400">Uptime</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <div className="text-xl font-bold text-white">1.2s</div>
                  <div className="text-xs text-gray-400">Response Time</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <div className="text-xl font-bold text-white">15.2K</div>
                  <div className="text-xs text-gray-400">Requests/day</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <div className="text-xl font-bold text-white">0.01%</div>
                  <div className="text-xs text-gray-400">Error Rate</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

