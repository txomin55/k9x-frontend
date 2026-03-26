import { renderSolid } from "@lib/../.storybook/renderSolid";
import ProfileImage from "@lib/components/molecules/profile-image/ProfileImage";
import type { ProfileImageProps } from "@lib/components/molecules/profile-image/ProfileImage.types";

const meta = {
  title: "Molecules/ProfileImage",
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    fallback: { control: "text" },
  },
  render: (args: ProfileImageProps) => renderSolid(() => <ProfileImage {...args} />),
};

export default meta;

export const Basic = {
  args: {
    src: "https://placehold.co/96x96/png",
    alt: "profile image",
    fallback: "PI",
  },
};
