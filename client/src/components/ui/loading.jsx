import React from 'react';
import { Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen dark:bg-gray-900 bg-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          transition: { 
            duration: 0.5,
            type: "spring",
            stiffness: 300
          }
        }}
      >
        <Card className="w-full max-w-md shadow-2xl dark:shadow-purple-900/20">
          <CardHeader className="text-center">
            <motion.div
              animate={{ 
                rotate: 360,
                transition: { 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear" 
                }
              }}
              className="mx-auto mb-4"
            >
              <Loader2 
                className="w-16 h-16 text-purple-600 dark:text-purple-400 
                animate-spin mx-auto"
              />
            </motion.div>
            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
              AI Support Hub
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
              Preparing your personalized experience...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: ['0%', '50%', '80%', '100%'],
                    transition: { 
                      duration: 2, 
                      times: [0, 0.4, 0.7, 1],
                      repeat: Infinity,
                      repeatType: "loop"
                    }
                  }}
                  className="h-2 bg-purple-600 dark:bg-purple-400 rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;