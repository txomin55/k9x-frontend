import AtomButton, {
	BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import { useNavigate } from "@tanstack/solid-router";
import { createSignal, Index, Show } from "solid-js";
import WrongLocationForm from "@/components/routes/stages/stages-map/WrongLocationForm";
import type { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { useI18n } from "@/stores/i18n/i18n";
import { canSeeClassification } from "@/utils/event";
import {
	getMarkerColorByStatus,
	getMarkerTextColorByStatus,
	isStageLive,
} from "@/utils/stage";
import { formatStageDateRange } from "@/utils/date";

interface StageMapMarker {
	stage: StageSummaryResponseDTO;
}

export function StageMapMarkerPopup(props: StageMapMarker) {
	const navigate = useNavigate();
	const i18n = useI18n();
	const getDisciplineLabel = (discipline?: string | { name?: string }) =>
		typeof discipline === "string" ? discipline : (discipline?.name ?? "");
	const navigateToClassification = (eventId: string) =>
		void navigate({
			params: { id: props.stage.id, eventId },
			to: "/stages/$id/events/$eventId/classification",
		});

	const navigateToStageInfo = (stageId: string) =>
		void navigate({
			params: { id: stageId },
			to: "/stages/$id/info",
		});

	const [openWrongLocationForm, setOpenWrongLocationForm] = createSignal(false);
	return (
		<div class="stages-map-marker-popup">
			<span class="stages-map-marker-popup__title">
				<span class="text-body-md">{props.stage.name}</span>
				<span class="text-caption-sm">
					{formatStageDateRange(props.stage.dateFrom ?? 0, props.stage.dateTo ?? 0)}
				</span>
			</span>
			<span class="text-body-sm">{props.stage.description}</span>
			<AtomDialog
				closeButtonText={i18n.t("STAGES.STAGES_MAP.MARKER.CLOSE_DIALOG")}
				content={
					<WrongLocationForm
						stageId={props.stage.id}
						onClose={() => setOpenWrongLocationForm(false)}
					/>
				}
				onOpenChange={setOpenWrongLocationForm}
				open={openWrongLocationForm()}
				title={i18n.t("STAGES.STAGES_MAP.MARKER.WRONG_LOCATION")}
				trigger={
					<AtomButton type={BUTTON_TYPES.GHOST}>
						{i18n.t("STAGES.STAGES_MAP.MARKER.WRONG_LOCATION_QUESTION")}
					</AtomButton>
				}
			/>
			<AtomButton
				type={BUTTON_TYPES.ACCENT}
				onClick={() => navigateToStageInfo(props.stage.id)}
			>
				{i18n.t("STAGES.STAGES_MAP.MARKER.INFO")}
			</AtomButton>

			<Index each={props.stage.events ?? []}>
				{(event) => (
					<div class="stages-map-marker-popup__row">
						<div class="stages-map-marker-popup__row--title">
							<span class="text-caption-sm">{event().status}</span>
							<span class="text-caption-sm">
								{event().name} {getDisciplineLabel(event().discipline)}
							</span>
						</div>
						<Show when={canSeeClassification(event().status)}>
							<AtomButton onClick={() => navigateToClassification(event().id)}>
								{i18n.t("STAGES.STAGES_MAP.MARKER.VIEW_QUALIFICATIONS")}
							</AtomButton>
						</Show>
					</div>
				)}
			</Index>
		</div>
	);
}

export function StageMapMarker(props: StageMapMarker) {
	return (
		<div
			role="img"
			aria-label={props.stage.name}
			classList={{
				"stages-map-marker": true,
				"stages-map-marker--live": isStageLive(props.stage.status),
			}}
			style={{
				background: getMarkerColorByStatus(props.stage.status),
				color: getMarkerTextColorByStatus(props.stage.status),
			}}
		/>
	);
}
