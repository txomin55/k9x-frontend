import { renderSolid } from "@lib/../.storybook/renderSolid";
import ProfileImage, {
  type ProfileImageProps,
} from "@lib/components/molecules/profile-image/ProfileImage";

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
