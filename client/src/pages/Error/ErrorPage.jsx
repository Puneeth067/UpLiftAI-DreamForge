import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export const ErrorPage = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10 bg-surface dark:bg-surface">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-600 dark:text-red-400">Error Occurred</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-foreground/70 dark:text-foreground/70">
            {error?.message || "Sorry, something went wrong on our end. We're working to fix it."}
          </p>
          {error?.stack && (
            <div className="mt-4 p-4 bg-background dark:bg-background rounded-lg overflow-auto max-h-32 border border-primary/20">
              <pre className="text-sm text-foreground/60 dark:text-foreground/60">
                {error.stack}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-primary/30 text-primary hover:bg-primary/10 dark:border-primary/40 dark:text-primary dark:hover:bg-primary/20"
          >
            Try Again
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary-hover text-white dark:bg-primary dark:hover:bg-primary-hover"
          >
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

ErrorPage.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
    stack: PropTypes.string
  })
};

export default ErrorPage;