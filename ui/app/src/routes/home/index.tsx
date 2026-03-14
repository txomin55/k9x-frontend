import { Title } from "@solidjs/meta";
import AnimalIcon from "@lib/components/molecules/animal-icon/AnimalIcon";
import { availableAnimalNames } from "@lib/components/molecules/animal-icon/animals.constants";
import AuthGuard from "@/guards/auth/AuthGuard";

export default function HomeRoute() {
  return (
    <AuthGuard>
      <Title>Home</Title>
      <>
        <h1>ESTAS LOGUEADO</h1>
        <AnimalIcon animal={availableAnimalNames.CAT} />
      </>
    </AuthGuard>
  );
}
