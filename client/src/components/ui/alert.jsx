import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import PropTypes from "prop-types"
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = forwardRef((props, ref) => {
  const { className, variant, ...rest } = props;
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...rest}
    />
  );
});
Alert.displayName = "Alert";

const AlertTitle = forwardRef((props, ref) => {
  const { className, ...rest } = props;
  return (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...rest}
    />
  );
});
AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef((props, ref) => {
  const { className, ...rest } = props;
  return (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...rest}
    />
  );
});
AlertDescription.displayName = "AlertDescription";

Alert.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "destructive"]),
  children: PropTypes.node,
};

AlertTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  props: PropTypes.object,
};  

AlertDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  props: PropTypes.object,
};


export { Alert, AlertTitle, AlertDescription };
