import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10 bg-surface dark:bg-surface">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-accent dark:text-accent" />
          </div>
          <CardTitle className="text-2xl text-foreground dark:text-foreground">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-4xl font-bold text-primary dark:text-primary">404</p>
          <p className="text-foreground/70 dark:text-foreground/70">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-primary/30 text-primary hover:bg-primary/10 dark:border-primary/40 dark:text-primary dark:hover:bg-primary/20"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary-hover text-white dark:bg-primary dark:hover:bg-primary-hover"
          >
            Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFoundPage;