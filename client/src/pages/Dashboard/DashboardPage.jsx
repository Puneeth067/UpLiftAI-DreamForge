import React from 'react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Card } from '@/components/ui/card';
import {
  TicketCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';

const DashboardPage = () => {
  const userType = localStorage.getItem('userType') || '';

  const metrics = [
    {
      title: 'Total Tickets',
      value: '12',
      change: '+2.5%',
      icon: TicketCheck,
      description: 'Total tickets this month'
    },
    {
      title: 'Open Tickets',
      value: '4',
      change: '-1.5%',
      icon: Clock,
      description: 'Currently open tickets'
    },
    {
      title: 'Resolved Tickets',
      value: '8',
      change: '+3.2%',
      icon: CheckCircle,
      description: 'Resolved this month'
    },
    {
      title: 'Average Response Time',
      value: '2h 15m',
      change: '-12.5%',
      icon: Activity,
      description: 'Average time to first response'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />
      <div className="flex">
        <Sidebar userType={userType} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here's an overview of your support tickets.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.title} className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <metric.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {metric.value}
                      </p>
                      <p className={`ml-2 text-sm ${
                        metric.change.startsWith('+') 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {metric.change}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">{metric.description}</p>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Recent Tickets</h2>
              <div className="mt-4 space-y-4">
                {[1, 2, 3].map((ticket) => (
                  <div
                    key={ticket}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Cannot access dashboard after update
                        </p>
                        <p className="text-sm text-gray-500">
                          Ticket #{ticket}000 • Created 2h ago
                        </p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        In Progress
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Activity Timeline</h2>
              <div className="mt-4 space-y-6">
                {[
                  {
                    action: 'Ticket Updated',
                    description: 'Added new comment to ticket #1002',
                    time: '2 hours ago'
                  },
                  {
                    action: 'Status Change',
                    description: 'Marked ticket #1001 as resolved',
                    time: '4 hours ago'
                  },
                  {
                    action: 'New Ticket',
                    description: 'Created ticket #1003',
                    time: '1 day ago'
                  }
                ].map((activity, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className="text-sm text-gray-500">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;