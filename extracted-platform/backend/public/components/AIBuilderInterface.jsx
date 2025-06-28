import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  Bot, 
  Brain, 
  Sparkles, 
  Upload, 
  FileText, 
  MessageSquare, 
  Settings, 
  BarChart3,
  Zap,
  Target,
  TrendingUp,
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
  Activity
} from 'lucide-react'

export default function AIBuilderInterface() {
  const [activeTab, setActiveTab] = useState('overview')
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [aiConfig, setAiConfig] = useState({
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 500,
    personality: 'helpful and professional',
    customInstructions: '',
    confidenceThreshold: 0.7,
    fallbackEnabled: true,
    contextMemory: true,
    learningEnabled: true
  })

  // Simulate training progress
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            setIsTraining(false)
            return 100
          }
          return prev + Math.random() * 10
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isTraining])

  const startTraining = () => {
    setIsTraining(true)
    setTrainingProgress(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI Chatbot Builder</h1>
              <p className="text-gray-300">Train and configure intelligent AI-powered chatbots</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Active Models</p>
                    <p className="text-2xl font-bold text-white">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Accuracy</p>
                    <p className="text-2xl font-bold text-white">94.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Conversations</p>
                    <p className="text-2xl font-bold text-white">12.5K</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Response Time</p>
                    <p className="text-2xl font-bold text-white">1.2s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white/10 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-purple-400" />
                    AI Model Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Current Model</span>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                      GPT-3.5 Turbo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Training Status</span>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Trained
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Last Updated</span>
                    <span className="text-gray-400">2 hours ago</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Play className="mr-2 h-4 w-4" />
                    Start New Training
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-400" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Accuracy</span>
                      <span className="text-white">94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Confidence</span>
                      <span className="text-white">87.5%</span>
                    </div>
                    <Progress value={87.5} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Response Quality</span>
                      <span className="text-white">91.8%</span>
                    </div>
                    <Progress value={91.8} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Training Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: 1, name: 'Customer Support Training', status: 'Completed', accuracy: '94.2%', date: '2 hours ago' },
                    { id: 2, name: 'Product Knowledge Update', status: 'Completed', accuracy: '91.8%', date: '1 day ago' },
                    { id: 3, name: 'FAQ Enhancement', status: 'In Progress', accuracy: '89.5%', date: '2 days ago' }
                  ].map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/20 rounded">
                          <Brain className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{session.name}</p>
                          <p className="text-sm text-gray-400">{session.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={session.status === 'Completed' ? 'secondary' : 'outline'}>
                          {session.status}
                        </Badge>
                        <span className="text-sm text-gray-300">{session.accuracy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Upload className="mr-2 h-5 w-5 text-blue-400" />
                    Training Data
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Upload documents, FAQs, or conversation logs to train your AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-300 mb-2">Drop files here or click to upload</p>
                    <p className="text-sm text-gray-500">Supports PDF, TXT, CSV, JSON</p>
                    <Button variant="outline" className="mt-4 border-gray-600 text-gray-300">
                      Choose Files
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">Training Type</Label>
                    <Select>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select training type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="faq">FAQ Training</SelectItem>
                        <SelectItem value="documents">Document Training</SelectItem>
                        <SelectItem value="conversations">Conversation Logs</SelectItem>
                        <SelectItem value="custom">Custom Dataset</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-green-400" />
                    Training Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isTraining ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Training in progress...</span>
                        <span className="text-white">{Math.round(trainingProgress)}%</span>
                      </div>
                      <Progress value={trainingProgress} className="h-3" />
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Estimated time remaining: {Math.max(0, Math.round((100 - trainingProgress) / 10))} minutes</span>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsTraining(false)}
                        className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Stop Training
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <Cpu className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-300 mb-2">Ready to start training</p>
                        <p className="text-sm text-gray-500">Upload training data and configure settings</p>
                      </div>
                      <Button 
                        onClick={startTraining}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Training
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Training History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: 1, name: 'Customer Support Dataset', date: '2024-06-27', duration: '45 min', accuracy: '94.2%', status: 'Completed' },
                    { id: 2, name: 'Product Knowledge Base', date: '2024-06-26', duration: '32 min', accuracy: '91.8%', status: 'Completed' },
                    { id: 3, name: 'FAQ Collection', date: '2024-06-25', duration: '28 min', accuracy: '89.5%', status: 'Completed' }
                  ].map((training) => (
                    <div key={training.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/20 rounded">
                          <Database className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{training.name}</p>
                          <p className="text-sm text-gray-400">{training.date} • {training.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white">{training.accuracy}</p>
                          <p className="text-sm text-gray-400">{training.status}</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-gray-600">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-purple-400" />
                    AI Model Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Model Type</Label>
                    <Select value={aiConfig.model} onValueChange={(value) => setAiConfig({...aiConfig, model: value})}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="claude-3">Claude 3</SelectItem>
                        <SelectItem value="custom">Custom Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Temperature: {aiConfig.temperature}</Label>
                    <Slider
                      value={[aiConfig.temperature]}
                      onValueChange={(value) => setAiConfig({...aiConfig, temperature: value[0]})}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Controls randomness in responses</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Max Tokens</Label>
                    <Input
                      type="number"
                      value={aiConfig.maxTokens}
                      onChange={(e) => setAiConfig({...aiConfig, maxTokens: parseInt(e.target.value)})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Confidence Threshold: {aiConfig.confidenceThreshold}</Label>
                    <Slider
                      value={[aiConfig.confidenceThreshold]}
                      onValueChange={(value) => setAiConfig({...aiConfig, confidenceThreshold: value[0]})}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bot className="mr-2 h-5 w-5 text-blue-400" />
                    Personality & Behavior
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Personality</Label>
                    <Input
                      value={aiConfig.personality}
                      onChange={(e) => setAiConfig({...aiConfig, personality: e.target.value})}
                      placeholder="e.g., helpful and professional"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Custom Instructions</Label>
                    <Textarea
                      value={aiConfig.customInstructions}
                      onChange={(e) => setAiConfig({...aiConfig, customInstructions: e.target.value})}
                      placeholder="Additional instructions for the AI..."
                      className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Enable Fallback Responses</Label>
                      <Switch
                        checked={aiConfig.fallbackEnabled}
                        onCheckedChange={(checked) => setAiConfig({...aiConfig, fallbackEnabled: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Context Memory</Label>
                      <Switch
                        checked={aiConfig.contextMemory}
                        onCheckedChange={(checked) => setAiConfig({...aiConfig, contextMemory: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">Continuous Learning</Label>
                      <Switch
                        checked={aiConfig.learningEnabled}
                        onCheckedChange={(checked) => setAiConfig({...aiConfig, learningEnabled: checked})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <TestingInterface />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsInterface />
          </TabsContent>

          {/* Deployment Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <DeploymentInterface />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Testing Interface Component
function TestingInterface() {
  const [testMessage, setTestMessage] = useState('')
  const [testResults, setTestResults] = useState([])

  const sendTestMessage = () => {
    if (!testMessage.trim()) return

    const response = {
      id: Date.now(),
      userMessage: testMessage,
      aiResponse: "This is a simulated AI response to your test message. The AI would analyze your input and provide a contextual response based on its training.",
      confidence: Math.random() * 0.3 + 0.7,
      responseTime: Math.random() * 1000 + 500,
      intent: 'general_inquiry'
    }

    setTestResults([response, ...testResults])
    setTestMessage('')
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-green-400" />
            Test Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Test Message</Label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Type a message to test your AI..."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <Button 
            onClick={sendTestMessage}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <Play className="mr-2 h-4 w-4" />
            Send Test Message
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-400">No test results yet</p>
              </div>
            ) : (
              testResults.map((result) => (
                <div key={result.id} className="space-y-3 p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">User:</p>
                      <p className="text-gray-300">{result.userMessage}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded">
                      <Bot className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">AI:</p>
                      <p className="text-gray-300">{result.aiResponse}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="border-gray-600">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </Badge>
                    <span className="text-gray-400">
                      {result.responseTime.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Analytics Interface Component
function AnalyticsInterface() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-lg">Response Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">94.2%</div>
              <Progress value={94.2} className="h-2 mb-2" />
              <p className="text-sm text-gray-400">+2.3% from last week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-lg">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">1.2s</div>
              <Progress value={75} className="h-2 mb-2" />
              <p className="text-sm text-gray-400">-0.3s from last week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-lg">User Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">4.7/5</div>
              <Progress value={94} className="h-2 mb-2" />
              <p className="text-sm text-gray-400">+0.2 from last week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Intent Recognition Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { intent: 'Greeting', accuracy: 98.5, count: 1250 },
              { intent: 'Product Inquiry', accuracy: 94.2, count: 890 },
              { intent: 'Support Request', accuracy: 91.8, count: 650 },
              { intent: 'Pricing Question', accuracy: 89.3, count: 420 },
              { intent: 'General Question', accuracy: 85.7, count: 380 }
            ].map((item) => (
              <div key={item.intent} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{item.intent}</span>
                    <span className="text-gray-300">{item.accuracy}%</span>
                  </div>
                  <Progress value={item.accuracy} className="h-2" />
                  <p className="text-xs text-gray-400 mt-1">{item.count} samples</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Deployment Interface Component
function DeploymentInterface() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="mr-2 h-5 w-5 text-yellow-400" />
            Deployment Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Button className="h-20 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <div className="text-center">
                <Download className="mx-auto h-6 w-6 mb-2" />
                <div>Download Package</div>
                <div className="text-xs opacity-75">Self-hosted deployment</div>
              </div>
            </Button>
            
            <Button className="h-20 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
              <div className="text-center">
                <Zap className="mx-auto h-6 w-6 mb-2" />
                <div>Deploy to Cloud</div>
                <div className="text-xs opacity-75">Hosted solution</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Integration Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
            <div className="text-gray-400 mb-2">// Embed your AI chatbot</div>
            <div className="text-green-400">&lt;script src="https://botflo.ai/embed.js"&gt;&lt;/script&gt;</div>
            <div className="text-blue-400">&lt;script&gt;</div>
            <div className="text-white ml-4">BotFlo.init(&#123;</div>
            <div className="text-white ml-8">botId: 'your-bot-id',</div>
            <div className="text-white ml-8">theme: 'dark',</div>
            <div className="text-white ml-8">position: 'bottom-right'</div>
            <div className="text-white ml-4">&#125;);</div>
            <div className="text-blue-400">&lt;/script&gt;</div>
          </div>
          <Button variant="outline" className="mt-4 border-gray-600 text-gray-300">
            Copy Code
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

