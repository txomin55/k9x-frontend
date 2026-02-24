import AnimalIcon, {
  ANIMALS,
} from "@lib/components/molecules/animal-icon/AnimalIcon";

const HomePage = () => {
  return (
    <>
      <h1>ESTAS LOGUEADO</h1>
      <AnimalIcon animal={ANIMALS.CAT} />
    </>
  );
};

export default HomePage;
