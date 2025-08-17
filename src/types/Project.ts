export interface Project {
  id: string;
  videoUrl: string;
  title: string;
  subtitle: string;
  services: string[];
  client: string;
  small: boolean;
  link?: string;
  linkTitle?: string;
}