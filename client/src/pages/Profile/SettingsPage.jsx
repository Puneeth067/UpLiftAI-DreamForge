import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  Moon,
  Globe,
  Shield,
  MessageSquare,
  Clock,
  Volume2,
  Languages,
  ArrowLeft,
  Smartphone,
  Mail,
  AlertTriangle
} from 'lucide-react';

const SettingsPage = ({ userType = 'user', onNavigateBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-10 flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              onClick={onNavigateBack}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft size={18} />
              Back to Profile
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Appearance Settings */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Moon size={22} className="text-blue-500" />
                  <h2 className="text-2xl font-semibold">Appearance</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors">
                  <div>
                    <h3 className="font-medium text-lg">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Toggle dark mode theme</p>
                  </div>
                  <Switch className="scale-110" />
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors">
                  <div>
                    <h3 className="font-medium text-lg">Compact View</h3>
                    <p className="text-sm text-gray-500">Reduce padding and spacing</p>
                  </div>
                  <Switch className="scale-110" />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Bell size={22} className="text-blue-500" />
                  <h2 className="text-2xl font-semibold">Notifications</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {userType === 'user' ? (
                  <>
                    <div className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors">
                      <div>
                        <h3 className="font-medium text-lg">Ticket Updates</h3>
                        <p className="text-sm text-gray-500">Get notified about your ticket status</p>
                      </div>
                      <Switch defaultChecked className="scale-110" />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors">
                      <div>
                        <h3 className="font-medium text-lg">Support Messages</h3>
                        <p className="text-sm text-gray-500">Receive messages from support team</p>
                      </div>
                      <Switch defaultChecked className="scale-110" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors">
                      <div>
                        <h3 className="font-medium text-lg">New Ticket Alerts</h3>
                        <p className="text-sm text-gray-500">Get notified about new tickets</p>
                      </div>
                      <Switch defaultChecked className="scale-110" />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors">
                      <div>
                        <h3 className="font-medium text-lg">Ticket Assignment</h3>
                        <p className="text-sm text-gray-500">Notifications when tickets are assigned to you</p>
                      </div>
                      <Switch defaultChecked className="scale-110" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Language and Region */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Globe size={22} className="text-blue-500" />
                  <h2 className="text-2xl font-semibold">Language & Region</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Zone</label>
                    <Select defaultValue="utc">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Time Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">EST</SelectItem>
                        <SelectItem value="pst">PST</SelectItem>
                        <SelectItem value="gmt">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Deactivation */}
            <Card className="border-red-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-red-50 dark:bg-red-900/20 rounded-t-lg">
                <div className="flex items-center gap-3 text-red-500">
                  <AlertTriangle size={22} />
                  <h2 className="text-2xl font-semibold">Account Actions</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription>
                    <div className="flex flex-col space-y-4">
                      <h3 className="font-medium text-lg">Deactivate Account</h3>
                      <p className="text-sm">
                        {userType === 'user' 
                          ? "Deactivating your account will remove access to the support system and delete all your tickets."
                          : "Deactivating your agent account will remove your access and reassign your active tickets."}
                      </p>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        Deactivate Account
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

