import AtomInput from "@lib/components/atoms/input/AtomInput";
import "./styles.css";

type NameFilterProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
};

export default function NameFilter(props: NameFilterProps) {
	return (
		<div class="name-filter">
			<AtomInput
				type="search"
				label={props.label}
				value={props.value}
				onChange={props.onChange}
			/>
		</div>
	);
}
