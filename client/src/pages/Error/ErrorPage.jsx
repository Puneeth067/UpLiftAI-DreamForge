import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ErrorPage = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">Error Occurred</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {error?.message || "Sorry, something went wrong on our end. We're working to fix it."}
          </p>
          {error?.stack && (
            <div className="mt-4 p-4 bg-muted rounded-lg overflow-auto max-h-32">
              <pre className="text-sm text-muted-foreground">
                {error.stack}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
          <Button
            onClick={() => navigate("/")}
          >
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorPage;