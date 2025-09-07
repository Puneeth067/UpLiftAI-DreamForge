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
    <div className="flex items-center justify-center h-screen bg-[#FAFAFF] dark:bg-[#0A0F1C] p-4">
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
        <Card className="w-full max-w-md shadow-2xl bg-surface dark:bg-surface">
          <CardHeader className="text-center">
            {/* Animated Loader */}
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
                className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto"
              />
            </motion.div>

            {/* Title */}
            <CardTitle className="text-2xl text-foreground">
              DreamForge
            </CardTitle>

            {/* Subtitle */}
            <CardDescription className="text-secondary mt-2 dark:text-secondary">
              Crafting your personalized creative space...
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              {/* Progress Bar Track */}
              <div className="h-2 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
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
                  className="h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"
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
