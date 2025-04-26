import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSiteSettings, SiteSetting } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "lucide-react";

export function SocialMediaSettings() {
  const {
    socialMediaSettings,
    isLoadingSocialMedia,
    updateSetting,
    isPending,
  } = useSiteSettings();

  const [formValues, setFormValues] = React.useState<Record<string, string>>(
    {},
  );

  React.useEffect(() => {
    if (socialMediaSettings && socialMediaSettings.length > 0) {
      const initialValues = socialMediaSettings.reduce(
        (acc: Record<string, string>, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        },
        {} as Record<string, string>,
      );
      setFormValues(initialValues);
    }
  }, [socialMediaSettings]);

  const handleInputChange = (key: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = (key: string) => {
    updateSetting(key, formValues[key] || "");
  };

  if (isLoadingSocialMedia) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>
            Manage your social media links that appear in the footer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getSocialIcon = (key: string) => {
    switch (key) {
      case "social_facebook":
        return <FacebookIcon className="h-4 w-4" />;
      case "social_twitter":
        return <TwitterIcon className="h-4 w-4" />;
      case "social_instagram":
        return <InstagramIcon className="h-4 w-4" />;
      case "social_linkedin":
        return <LinkedinIcon className="h-4 w-4" />;
      case "social_youtube":
        return <YoutubeIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Manage your social media links that appear in the footer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {socialMediaSettings &&
          socialMediaSettings.map((setting: SiteSetting) => (
            <div key={setting.key} className="space-y-2">
              <Label htmlFor={setting.key} className="flex items-center gap-2">
                {getSocialIcon(setting.key)}
                {setting.label}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={setting.key}
                  placeholder={`Enter ${setting.label}`}
                  value={formValues[setting.key] || ""}
                  onChange={(e) =>
                    handleInputChange(setting.key, e.target.value)
                  }
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSave(setting.key)}
                  disabled={
                    isPending || formValues[setting.key] === setting.value
                  }
                >
                  Save
                </Button>
              </div>
              {setting.description && (
                <p className="text-xs text-muted-foreground">
                  {setting.description}
                </p>
              )}
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
