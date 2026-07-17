## Fallow: no issues found

## Fallow: no code duplication found

## Vital Signs

| Metric | Value |
|:-------|------:|
| Total LOC | 39822 |
| Avg Cyclomatic | 1.7 |
| P90 Cyclomatic | 3 |
| Dead Files | 0.0% |
| Dead Exports | 0.0% |
| Maintainability (avg) | 91.6 |
| Hotspots (since 6 months) | 1 |
| Circular Deps | 0 |
| Unused Deps | 0 |

## Fallow: 72 high complexity functions

| File | Function | Severity | Cyclomatic | Cognitive | CRAP | Lines |
|:-----|:---------|:---------|:-----------|:----------|:-----|:------|
| `ui/app/src/services/secured/event-crud/eventCrud.ts:202` | `mergeApiEventWithPayload` | critical | 52 **!** | 19 **!** | 636.1 **!** | 106 |
| `ui/app/src/services/secured/event-crud/eventCrud.ts:176` | `toApiCompetitor` | critical | 38 **!** | 16 **!** | 349.9 **!** | 25 |
| `ui/app/playwright/api-mocks/eventDetail.ts:181` | `competitors` | critical | 30 **!** | 9 | 224.4 **!** | 25 |
| `ui/app/src/services/secured/dog-crud/dogCrudOfflineUtils.ts:24` | `toDogListItem` | critical | 27 **!** | 12 | 756.0 **!** | 16 |
| `ui/app/src/services/secured/competition-crud/competitionCrud.ts:112` | `mergeCompetitionWithPayload` | critical | 25 **!** | 12 | 160.0 **!** | 27 |
| `ui/app/src/services/secured/stage-crud/stageCrud.ts:29` | `mergeApiStageWithPayload` | critical | 22 **!** | 9 | 506.0 **!** | 19 |
| `ui/app/src/components/routes/my/collections/$id/obdx/ObdxCollectionDetail.tsx:85` | `ObdxCollectionDetail` | high | 17 | 17 **!** | 79.4 **!** | 379 |
| `ui/app/src/routes/my/competitions/$id/index.tsx:193` | `CompetitionDetailBody` | critical | 15 | 9 | 240.0 **!** | 265 |
| `ui/app/src/utils/http/client.ts:64` | `extractErrorMessage` | high | 14 | 8 | 56.3 **!** | 23 |
| `ui/app/src/services/secured/event-crud/eventCrud.types.ts:184` | `normalizeCompetitor` | high | 14 | 12 | 56.3 **!** | 19 |
| `ui/app/src/services/secured/event-crud/eventCrud.ts:74` | `toApiExercise` | high | 14 | 5 | 56.3 **!** | 21 |
| `ui/app/src/services/secured/event-crud/eventCrud.ts:96` | `toApiEventConfiguration` | moderate | 13 | 3 | 49.5 **!** | 11 |
| `ui/app/src/routes/stages/index.tsx:137` | `<arrow>` | critical | 12 | 11 | 156.0 **!** | 11 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/competitor/CompetitorEditorForm.tsx:114` | `<arrow>` | critical | 12 | 7 | 156.0 **!** | 12 |
| `ui/app/src/routes/my/competitions/$id/index.tsx:377` | `commitCompetitionEdits` | critical | 12 | 9 | 156.0 **!** | 27 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/competitor/EventCompetitorsSection.tsx:97` | `getCompetitorDetails` | critical | 12 | 6 | 156.0 **!** | 13 |
| `ui/app/src/utils/local-first/pending_tasks/pendingTasksRunner.ts:47` | `<arrow>` | moderate | 11 | 18 **!** | 37.1 **!** | 54 |
| `ui/app/src/utils/service-worker/offline_bundle/warmOfflineBundle.ts:86` | `warmOfflineBundle` | moderate | 11 | 8 | 37.1 **!** | 41 |
| `ui/library/.storybook/withDarkTheme.decorator.ts:61` | `getThemeFromManagerDom` | critical | 11 | 9 | 132.0 **!** | 36 |
| `ui/app/src/services/secured/dog-crud/dogDraftStore.ts:59` | `replaceDogDrafts` | critical | 10 | 11 | 110.0 **!** | 26 |
| `ui/app/src/services/secured/judge-crud/judgeCrud.ts:86` | `mergeJudgeWithPayload` | critical | 10 | 3 | 110.0 **!** | 8 |
| `ui/app/src/components/routes/my/judges/list/judge-form/JudgeForm.tsx:25` | `JudgeForm` | critical | 10 | 10 | 110.0 **!** | 62 |
| `ui/app/src/services/secured/judge-crud/judgeDraftStore.ts:46` | `replaceJudgeDrafts` | critical | 10 | 11 | 110.0 **!** | 28 |
| `ui/app/playwright/config/mcr.config.ts:42` | `normalizeCoverageSourcePath` | moderate | 10 | 9 | 31.6 **!** | 46 |
| `ui/app/smoke/auth.setup.ts:16` | `readCredentials` | high | 8 | 6 | 72.0 **!** | 13 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/configuration/ConfigurationEditorForm.tsx:119` | `<arrow>` | high | 8 | 5 | 72.0 **!** | 17 |
| `ui/app/src/routes/stages/index.tsx:207` | `<arrow>` | high | 7 | 5 | 56.0 **!** | 15 |
| `ui/app/src/routes/stages/$id/info.tsx:346` | `<arrow>` | high | 7 | 5 | 56.0 **!** | 87 |
| `ui/app/smoke/auth.setup.ts:135` | `<arrow>` | high | 7 | 8 | 56.0 **!** | 78 |
| `ui/app/src/components/routes/my/competitions/$id/competition-info/CompetitionInfo.tsx:32` | `CompetitionInfo` | high | 7 | 7 | 56.0 **!** | 100 |
| `ui/app/src/utils/service-worker/events/runtime-cache.ts:44` | `networkFirst` | high | 7 | 11 | 56.0 **!** | 32 |
| `ui/library/.storybook/withDarkTheme.decorator.ts:41` | `getThemeFromBackgroundGlobals` | high | 7 | 6 | 56.0 **!** | 19 |
| `ui/app/src/services/secured/judge-crud/judgeCrudOfflineUtils.ts:28` | `toJudgeListItem` | high | 7 | 2 | 56.0 **!** | 8 |
| `ui/app/src/components/routes/my/competitions/$id/stages-section/StageEditorForm.tsx:82` | `<arrow>` | high | 7 | 6 | 56.0 **!** | 45 |
| `ui/app/src/components/routes/stages/stages-map/StagesMap.tsx:117` | `<arrow>` | moderate | 6 | 4 | 42.0 **!** | 9 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseDetailTable.tsx:59` | `<arrow>` | moderate | 6 | 2 | 42.0 **!** | 19 |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/events/$eventId/index.tsx:586` | `saveCompetitorEditor` | moderate | 6 | 8 | 42.0 **!** | 58 |
| `ui/app/src/routes/my/competitions/$id/index.tsx:237` | `<arrow>` | moderate | 6 | 4 | 42.0 **!** | 22 |
| `ui/app/src/utils/service-worker/events/notification-click.ts:1` | `getAppUrlToOpen` | moderate | 6 | 5 | 42.0 **!** | 22 |
| `coverage_processor/total_coverage_processor.ts:44` | `normalizeFilePath` | moderate | 6 | 6 | 42.0 **!** | 18 |
| `ui/app/src/routes/stages/$id/events/$eventId/classification.tsx:197` | `<arrow>` | moderate | 6 | 4 | 42.0 **!** | 14 |
| `ui/app/src/routes/stages/$id/events/$eventId/classification.tsx:255` | `<arrow>` | moderate | 6 | 6 | 42.0 **!** | 23 |
| `ui/app/src/routes/stages/$id/events/$eventId/classification.tsx:334` | `handleExpandedChange` | moderate | 6 | 8 | 42.0 **!** | 13 |
| `ui/app/src/routes/my/judges/list/index.tsx:64` | `MyJudgesListPage` | moderate | 6 | 8 | 42.0 **!** | 227 |
| `ui/app/src/components/routes/my/dogs/list/dog-form/DogForm.tsx:31` | `DogForm` | moderate | 6 | 6 | 42.0 **!** | 248 |
| `ui/app/src/services/fetch-stages/stageEnroll.ts:96` | `events` | moderate | 6 | 3 | 42.0 **!** | 14 |
| `ui/library/.storybook/withDarkTheme.decorator.ts:14` | `isDarkColor` | moderate | 6 | 5 | 42.0 **!** | 26 |
| `ui/library/.storybook/withDarkTheme.decorator.ts:98` | `ensureManagerThemeSync` | moderate | 6 | 4 | 42.0 **!** | 37 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/judges/JudgeEditorForm.tsx:62` | `<arrow>` | moderate | 6 | 3 | 42.0 **!** | 8 |
| `ui/app/src/routes/my/dogs/list/index.tsx:53` | `MyDogsListPage` | moderate | 5 | 8 | 30.0 **!** | 346 |
| `ui/app/src/routes/stages/index.tsx:123` | `filteredStages` | moderate | 5 | 4 | 30.0 **!** | 26 |
| `ui/app/src/components/routes/stages/stages-map/StagesMap.tsx:67` | `<arrow>` | moderate | 5 | 2 | 30.0 **!** | 26 |
| `ui/app/src/routes/stages/$id/info.tsx:160` | `selectedEventName` | moderate | 5 | 1 | 30.0 **!** | 4 |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/events/$eventId/index.tsx:501` | `saveExerciseEditor` | moderate | 5 | 4 | 30.0 **!** | 57 |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/events/$eventId/index.tsx:68` | `CompetitionObdxEventDetailBody` | moderate | 5 | 6 | 30.0 **!** | 976 |
| `ui/app/src/routes/my/competitions/$id/index.tsx:273` | `<arrow>` | moderate | 5 | 4 | 30.0 **!** | 11 |
| `ui/app/src/routes/my/competitions/$id/index.tsx:302` | `openNewStageEditor` | moderate | 5 | 4 | 30.0 **!** | 17 |
| `ui/app/src/utils/service-worker/events/notification-click.ts:24` | `reuseOrOpenWindow` | moderate | 5 | 5 | 30.0 **!** | 17 |
| `ui/app/src/utils/router/breadcrumbs.ts:22` | `resolveBreadcrumb` | moderate | 5 | 6 | 30.0 **!** | 14 |
| `ui/app/src/services/secured/stage-crud/stageCrudOfflineUtils.ts:248` | `commitApiStageMutationSuccess` | moderate | 5 | 5 | 30.0 **!** | 45 |
| `ui/app/src/components/global/app-shell/layout/AppBreadcrumbs.tsx:29` | `<arrow>` | moderate | 5 | 3 | 30.0 **!** | 20 |
| `ui/app/src/utils/notifications/notifications.ts:34` | `subscribeToPushNotifications` | moderate | 5 | 4 | 30.0 **!** | 19 |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/index.tsx:321` | `<arrow>` | moderate | 5 | 4 | 30.0 **!** | 12 |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/index.tsx:385` | `commitStageEdits` | moderate | 5 | 3 | 30.0 **!** | 18 |
| `ui/app/src/utils/service-worker/events/runtime-cache.ts:185` | `<arrow>` | moderate | 5 | 4 | 30.0 **!** | 23 |
| `ui/app/src/utils/search-params/useSearchParam.ts:53` | `value` | moderate | 5 | 4 | 30.0 **!** | 13 |
| `ui/app/src/services/secured/dog-crud/dogCrudOfflineUtils.ts:91` | `commitDogMutationSuccess` | moderate | 5 | 6 | 30.0 **!** | 26 |
| `ui/app/scripts/prefix-build-paths.mjs:72` | `normalizePublicFilePath` | moderate | 5 | 4 | 30.0 **!** | 13 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/configuration/ConfigurationEditorForm.tsx:91` | `<arrow>` | moderate | 5 | 4 | 30.0 **!** | 15 |
| `ui/app/src/components/routes/my/dogs/list/dog-form/DogForm.tsx:198` | `<arrow>` | moderate | 5 | 2 | 30.0 **!** | 2 |
| `ui/app/src/services/fetch-stages/stageEnroll.ts:52` | `events` | moderate | 5 | 4 | 30.0 **!** | 29 |
| `ui/app/src/services/fetch-stages/stageEnroll.ts:198` | `createRollbackPayload` | moderate | 5 | 2 | 30.0 **!** | 19 |

**469** files, **2959** functions analyzed (thresholds: cyclomatic > 20, cognitive > 15, CRAP >= 30.0)

### File Health Scores (334 files)

| File | Maintainability | Fan-in | Fan-out | Dead Code | Density | Risk |
|:-----|:---------------|:-------|:--------|:----------|:--------|:-----|
| `ui/app/src/services/secured/dog-crud/dogCrudOfflineUtils.ts` | 81.0 | 2 | 8 | 0% | 0.34 | 756.0 |
| `ui/app/src/services/secured/event-crud/eventCrud.ts` | 77.4 | 3 | 18 | 0% | 0.36 | 636.1 |
| `ui/app/src/services/secured/stage-crud/stageCrud.ts` | 83.8 | 3 | 10 | 0% | 0.22 | 506.0 |
| `ui/app/src/routes/my/competitions/$id/index.tsx` | 82.0 | 1 | 19 | 0% | 0.20 | 240.0 |
| `ui/app/playwright/api-mocks/eventDetail.ts` | 83.9 | 4 | 9 | 0% | 0.23 | 224.4 |
| `ui/app/src/services/secured/competition-crud/competitionCrud.ts` | 81.4 | 13 | 15 | 0% | 0.25 | 160.0 |
| `ui/app/src/routes/stages/index.tsx` | 81.0 | 1 | 29 | 0% | 0.18 | 156.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/competitor/EventCompetitorsSection.tsx` | 82.8 | 1 | 25 | 0% | 0.14 | 156.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/competitor/CompetitorEditorForm.tsx` | 85.0 | 1 | 10 | 0% | 0.18 | 156.0 |
| `ui/library/.storybook/withDarkTheme.decorator.ts` | 91.9 | 1 | 0 | 0% | 0.27 | 132.0 |
| `ui/app/src/services/secured/judge-crud/judgeCrud.ts` | 83.2 | 3 | 11 | 0% | 0.23 | 110.0 |
| `ui/app/src/components/routes/my/judges/list/judge-form/JudgeForm.tsx` | 84.2 | 1 | 7 | 0% | 0.25 | 110.0 |
| `ui/app/src/services/secured/dog-crud/dogDraftStore.ts` | 85.5 | 2 | 1 | 0% | 0.39 | 110.0 |
| `ui/app/src/services/secured/judge-crud/judgeDraftStore.ts` | 85.5 | 2 | 1 | 0% | 0.39 | 110.0 |
| `ui/app/src/components/routes/my/collections/$id/obdx/ObdxCollectionDetail.tsx` | 81.1 | 1 | 19 | 0% | 0.23 | 79.4 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/configuration/ConfigurationEditorForm.tsx` | 84.7 | 1 | 6 | 0% | 0.25 | 72.0 |
| `ui/app/smoke/auth.setup.ts` | 90.9 | 0 | 1 | 0% | 0.21 | 72.0 |
| `ui/app/src/utils/http/client.ts` | 87.6 | 24 | 4 | 0% | 0.20 | 56.3 |
| `ui/app/src/services/secured/event-crud/eventCrud.types.ts` | 91.2 | 21 | 4 | 0% | 0.08 | 56.3 |
| `ui/app/src/routes/stages/$id/info.tsx` | 82.8 | 1 | 27 | 0% | 0.13 | 56.0 |
| `ui/app/src/services/secured/judge-crud/judgeCrudOfflineUtils.ts` | 83.7 | 1 | 8 | 0% | 0.25 | 56.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages-section/StageEditorForm.tsx` | 85.9 | 1 | 6 | 0% | 0.21 | 56.0 |
| `ui/app/src/components/routes/my/competitions/$id/competition-info/CompetitionInfo.tsx` | 87.3 | 1 | 8 | 0% | 0.13 | 56.0 |
| `ui/app/src/utils/service-worker/events/runtime-cache.ts` | 91.2 | 1 | 1 | 0% | 0.20 | 56.0 |
| `ui/app/src/routes/stages/$id/events/$eventId/classification.tsx` | 81.5 | 1 | 32 | 0% | 0.15 | 42.0 |
| `ui/app/src/components/routes/my/dogs/list/dog-form/DogForm.tsx` | 81.6 | 1 | 12 | 0% | 0.27 | 42.0 |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/events/$eventId/index.tsx` | 82.0 | 1 | 26 | 0% | 0.16 | 42.0 |
| `ui/app/src/routes/my/judges/list/index.tsx` | 82.8 | 1 | 23 | 0% | 0.15 | 42.0 |
| `ui/app/src/services/fetch-stages/stageEnroll.ts` | 85.6 | 2 | 10 | 0% | 0.16 | 42.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/judges/JudgeEditorForm.tsx` | 85.7 | 1 | 7 | 0% | 0.20 | 42.0 |
| `ui/app/src/components/routes/stages/stages-map/StagesMap.tsx` | 85.9 | 1 | 5 | 0% | 0.23 | 42.0 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseDetailTable.tsx` | 87.3 | 1 | 8 | 0% | 0.13 | 42.0 |
| `ui/app/src/utils/service-worker/events/notification-click.ts` | 91.6 | 1 | 0 | 0% | 0.28 | 42.0 |
| `coverage_processor/total_coverage_processor.ts` | 96.1 | 0 | 0 | 0% | 0.13 | 42.0 |
| `ui/app/src/utils/local-first/pending_tasks/pendingTasksRunner.ts` | 87.3 | 15 | 4 | 0% | 0.21 | 37.1 |
| `ui/app/src/utils/service-worker/offline_bundle/warmOfflineBundle.ts` | 89.0 | 3 | 2 | 0% | 0.22 | 37.1 |
| `ui/app/playwright/config/mcr.config.ts` | 93.1 | 3 | 0 | 0% | 0.23 | 31.6 |
| `ui/app/src/routes/my/dogs/list/index.tsx` | 82.2 | 1 | 25 | 0% | 0.16 | 30.0 |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/index.tsx` | 82.8 | 1 | 29 | 0% | 0.12 | 30.0 |
| `ui/app/src/services/secured/stage-crud/stageCrudOfflineUtils.ts` | 84.7 | 1 | 10 | 0% | 0.19 | 30.0 |
| `ui/app/src/components/global/app-shell/layout/AppBreadcrumbs.tsx` | 87.6 | 1 | 4 | 0% | 0.20 | 30.0 |
| `ui/app/src/utils/notifications/notifications.ts` | 91.8 | 2 | 1 | 0% | 0.18 | 30.0 |
| `ui/app/src/utils/search-params/useSearchParam.ts` | 92.8 | 8 | 0 | 0% | 0.24 | 30.0 |
| `ui/app/scripts/prefix-build-paths.mjs` | 93.7 | 0 | 0 | 0% | 0.21 | 30.0 |
| `ui/app/src/utils/router/breadcrumbs.ts` | 97.0 | 1 | 0 | 0% | 0.14 | 30.0 |
| `ui/app/src/services/secured/dog-crud/dogCrud.ts` | 83.8 | 5 | 11 | 0% | 0.21 | 20.0 |
| `ui/app/src/services/secured/breed-crud/breedCrud.ts` | 85.2 | 3 | 8 | 0% | 0.20 | 20.0 |
| `ui/app/src/services/secured/country-crud/countryCrud.ts` | 85.2 | 4 | 8 | 0% | 0.20 | 20.0 |
| `ui/app/src/routes/auth/callback.tsx` | 86.1 | 1 | 13 | 0% | 0.11 | 20.0 |
| `ui/app/src/components/global/app-shell/layout/navigation/NavigationUserMenu.tsx` | 86.2 | 1 | 14 | 0% | 0.10 | 20.0 |
| `ui/app/src/routes/index.tsx` | 86.2 | 1 | 15 | 0% | 0.09 | 20.0 |
| `ui/app/src/components/global/app-shell/AppShell.tsx` | 86.6 | 1 | 16 | 0% | 0.07 | 20.0 |
| `ui/app/src/components/routes/stages/stages-map/StageMapMarker.tsx` | 86.8 | 1 | 14 | 0% | 0.08 | 20.0 |
| `ui/app/src/components/global/app-shell/layout/PendingCollectionsDialog.tsx` | 87.7 | 1 | 6 | 0% | 0.15 | 20.0 |
| `ui/app/src/utils/validation/textField.ts` | 93.4 | 6 | 0 | 0% | 0.42 | 20.0 |
| `ui/library/.storybook/main.ts` | 96.7 | 0 | 0 | 0% | 0.11 | 20.0 |
| `ui/app/src/stores/auth/auth.ts` | 83.4 | 27 | 8 | 0% | 0.26 | 17.6 |
| `ui/app/smoke/utils/cleanup.ts` | 87.9 | 1 | 1 | 0% | 0.31 | 17.6 |
| `ui/app/playwright/utils/playwrightMockingUtils.ts` | 90.6 | 12 | 1 | 0% | 0.22 | 17.6 |
| `ui/library/src/components/atoms/table/AtomTable.tsx` | 91.2 | 12 | 1 | 0% | 0.20 | 13.8 |
| `ui/app/src/utils/stage.ts` | 91.9 | 12 | 0 | 0% | 0.27 | 13.8 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/judges/EventJudgesSection.tsx` | 84.2 | 1 | 16 | 0% | 0.15 | 12.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages-section/StagesSection.tsx` | 84.5 | 1 | 17 | 0% | 0.13 | 12.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/exercises/EventExercisesSection.tsx` | 84.7 | 1 | 15 | 0% | 0.14 | 12.0 |
| `ui/app/src/components/global/app-shell/layout/AppLayout.tsx` | 85.7 | 1 | 16 | 0% | 0.10 | 12.0 |
| `ui/app/src/components/routes/stages/stages-filters/StagesFilters.tsx` | 85.7 | 1 | 9 | 0% | 0.17 | 12.0 |
| `ui/app/src/components/common/event-discipline-field/EventDisciplineField.tsx` | 87.6 | 1 | 3 | 0% | 0.23 | 12.0 |
| `ui/app/src/components/common/floating-share-button/FloatingShareButton.tsx` | 88.0 | 1 | 5 | 0% | 0.16 | 12.0 |
| `ui/app/src/components/routes/stages/stage-card/StageCard.tsx` | 88.0 | 1 | 11 | 0% | 0.07 | 12.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/event-editor-form/EventEditorForm.tsx` | 88.1 | 1 | 9 | 0% | 0.09 | 12.0 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/score-chip/ScoreChip.tsx` | 89.7 | 2 | 4 | 0% | 0.13 | 12.0 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/ObdxClassificationContent.tsx` | 89.9 | 2 | 7 | 0% | 0.06 | 12.0 |
| `ui/app/src/stores/network/network.ts` | 90.7 | 3 | 1 | 0% | 0.26 | 12.0 |
| `ui/app/src/components/common/icon-toggle-button/IconToggleButton.tsx` | 91.4 | 2 | 2 | 0% | 0.21 | 12.0 |
| `ui/app/src/components/common/rank-badge/RankBadge.tsx` | 91.5 | 5 | 2 | 0% | 0.15 | 12.0 |
| `ui/app/src/routes/my/route.tsx` | 92.1 | 1 | 3 | 0% | 0.11 | 12.0 |
| `ui/app/src/providers/notifications/NotificationsInit.tsx` | 92.6 | 1 | 2 | 0% | 0.10 | 12.0 |
| `ui/app/src/router.tsx` | 93.8 | 1 | 2 | 0% | 0.10 | 12.0 |
| `ui/app/src/utils/service-worker/native_features/notifications/push-notifications.ts` | 95.2 | 1 | 0 | 0% | 0.16 | 12.0 |
| `ui/app/vite.config.ts` | 95.7 | 0 | 1 | 0% | 0.05 | 12.0 |
| `ui/app/src/manifest.ts` | 96.3 | 1 | 0 | 0% | 0.17 | 12.0 |
| `ui/app/src/routes/my/competitions/list/index.tsx` | 83.9 | 2 | 20 | 0% | 0.13 | 10.4 |
| `ui/app/src/services/secured/event-crud/eventCrudOfflineUtils.ts` | 84.7 | 1 | 11 | 0% | 0.18 | 10.4 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils.ts` | 86.9 | 8 | 2 | 0% | 0.29 | 10.4 |
| `ui/app/src/routes/my/collections/$id/route.tsx` | 89.0 | 2 | 7 | 0% | 0.09 | 10.4 |
| `ui/app/src/components/common/confirm-action-button/ConfirmActionButton.tsx` | 89.7 | 12 | 4 | 0% | 0.13 | 10.4 |
| `ui/app/src/routes/stages/$id/events/$eventId/classification.list-order.spec.ts` | 90.3 | 0 | 3 | 0% | 0.14 | 10.4 |
| `ui/app/src/components/common/country-flag/CountryFlag.tsx` | 91.2 | 22 | 1 | 0% | 0.20 | 10.4 |
| `ui/library/src/components/atoms/select/AtomSelect.tsx` | 92.7 | 21 | 1 | 0% | 0.15 | 10.4 |
| `ui/app/src/utils/classification-pdf.ts` | 93.0 | 2 | 1 | 0% | 0.14 | 10.4 |
| `ui/app/smoke/utils/flows.ts` | 93.6 | 1 | 1 | 0% | 0.12 | 10.4 |
| `ui/library/src/components/atoms/skeleton/AtomSkeleton.tsx` | 93.6 | 14 | 1 | 0% | 0.12 | 10.4 |
| `ui/app/src/utils/service-worker/offline_bundle/offlinePreloadManifest.ts` | 94.6 | 1 | 0 | 0% | 0.20 | 10.4 |
| `ui/library/src/components/atoms/input/AtomInput.tsx` | 94.8 | 14 | 1 | 0% | 0.08 | 10.4 |
| `ui/library/src/components/atoms/text-area/AtomTextArea.tsx` | 94.8 | 7 | 1 | 0% | 0.08 | 10.4 |
| `ui/app/src/services/secured/competition-crud/competitionDraftStore.ts` | 87.6 | 5 | 1 | 0% | 0.32 | 10.3 |
| `ui/app/src/utils/local-first/pending_tasks/commitOptimisticMutation.ts` | 88.9 | 5 | 6 | 0% | 0.11 | 9.3 |
| `ui/app/src/services/fetch-stages/fetchStages.ts` | 80.4 | 8 | 8 | 0% | 0.36 | 7.5 |
| `ui/app/src/services/secured/award-crud/awardCrud.ts` | 85.2 | 2 | 8 | 0% | 0.20 | 7.5 |
| `ui/app/src/services/secured/collection-crud/collectionCrud.ts` | 85.4 | 7 | 9 | 0% | 0.18 | 7.5 |
| `ui/app/src/components/routes/my/collections/$id/obdx/yellow-card/YellowCardDialog.tsx` | 86.0 | 1 | 9 | 0% | 0.16 | 7.5 |
| `ui/app/src/components/routes/my/collections/$id/obdx/red-card/RedCardDialog.tsx` | 86.3 | 1 | 9 | 0% | 0.15 | 7.5 |
| `ui/app/playwright/api-mocks/competitions.ts` | 86.8 | 4 | 6 | 0% | 0.18 | 7.5 |
| `ui/app/src/services/secured/configurations/configurations.ts` | 88.0 | 5 | 5 | 0% | 0.21 | 7.5 |
| `ui/app/src/utils/local-first/pending_tasks/pendingTasksStore.ts` | 88.5 | 16 | 3 | 0% | 0.20 | 7.5 |
| `ui/app/src/stores/i18n/i18n.ts` | 88.7 | 92 | 2 | 0% | 0.23 | 7.5 |
| `ui/app/src/components/routes/my/collections/$id/obdx/collection-exercise-scores/CollectionExerciseScores.tsx` | 89.7 | 1 | 3 | 0% | 0.16 | 7.5 |
| `ui/app/src/services/secured/collection-crud/collectionsDrafStore.ts` | 90.0 | 2 | 1 | 0% | 0.24 | 7.5 |
| `ui/library/src/components/atoms/number-input/AtomNumberInput.tsx` | 95.1 | 7 | 1 | 0% | 0.07 | 7.5 |
| `ui/app/src/services/secured/competition-crud/competitionCrudOfflineUtils.ts` | 85.4 | 5 | 9 | 0% | 0.18 | 6.1 |
| `ui/app/src/utils/paths/app-paths.ts` | 91.6 | 8 | 0 | 0% | 0.52 | 6.1 |
| `ui/app/src/components/routes/stages/stage-card/StageCardEventsContent.tsx` | 87.6 | 2 | 12 | 0% | 0.07 | 6.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/exercises/ExerciseEditorForm.tsx` | 87.8 | 1 | 7 | 0% | 0.13 | 6.0 |
| `ui/app/src/components/common/country-field/CountryField.tsx` | 88.5 | 3 | 4 | 0% | 0.17 | 6.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/configuration/EventConfigurationSection.tsx` | 88.9 | 1 | 5 | 0% | 0.13 | 6.0 |
| `ui/app/src/routes/my/collections/list/index.tsx` | 89.0 | 1 | 7 | 0% | 0.09 | 6.0 |
| `ui/app/src/components/global/app-shell/layout/navigation/OrganizerForm.tsx` | 89.8 | 1 | 7 | 0% | 0.08 | 6.0 |
| `ui/app/src/components/common/sex-icon/SexIcon.tsx` | 90.0 | 4 | 4 | 0% | 0.20 | 6.0 |
| `ui/app/src/components/global/app-shell/layout/navigation/ContactForm.tsx` | 90.3 | 2 | 6 | 0% | 0.08 | 6.0 |
| `ui/app/src/components/routes/stages/stages-map/WrongLocationForm.tsx` | 90.3 | 1 | 6 | 0% | 0.08 | 6.0 |
| `ui/app/src/components/global/app-shell/layout/navigation/OwnDogForm.tsx` | 90.5 | 1 | 6 | 0% | 0.07 | 6.0 |
| `ui/app/src/components/global/app-shell/layout/navigation/Navigation.tsx` | 90.7 | 1 | 6 | 0% | 0.05 | 6.0 |
| `ui/app/vitest-setup.ts` | 90.9 | 0 | 1 | 0% | 0.21 | 6.0 |
| `ui/library/src/components/atoms/breadcrumbs/AtomBreadcrumbs.tsx` | 91.5 | 1 | 3 | 0% | 0.10 | 6.0 |
| `ui/app/src/utils/service-worker/events/setup.ts` | 91.9 | 1 | 1 | 0% | 0.24 | 6.0 |
| `ui/app/src/entry-client.tsx` | 92.0 | 0 | 2 | 0% | 0.21 | 6.0 |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/route.tsx` | 92.1 | 1 | 2 | 0% | 0.19 | 6.0 |
| `ui/app/src/components/routes/stages/stage-card/StageCardSkeleton.tsx` | 92.6 | 1 | 3 | 0% | 0.07 | 6.0 |
| `ui/app/src/routes/my/competitions/$id/route.tsx` | 92.6 | 1 | 2 | 0% | 0.18 | 6.0 |
| `ui/library/src/components/atoms/table/AtomTable.stories.tsx` | 92.6 | 0 | 2 | 0% | 0.10 | 6.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/ObdxCompetitionEventDetailBodyWrapper.tsx` | 92.7 | 1 | 3 | 0% | 0.06 | 6.0 |
| `ui/library/src/components/atoms/combobox/AtomCombobox.stories.tsx` | 92.9 | 0 | 2 | 0% | 0.09 | 6.0 |
| `ui/library/src/components/atoms/checkbox/AtomCheckbox.stories.tsx` | 93.1 | 0 | 2 | 0% | 0.09 | 6.0 |
| `ui/app/src/routes/stages/$id/route.tsx` | 93.2 | 1 | 2 | 0% | 0.15 | 6.0 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/score-fraction/ScoreFraction.tsx` | 93.8 | 1 | 2 | 0% | 0.11 | 6.0 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/total-block/TotalBlock.tsx` | 94.5 | 2 | 2 | 0% | 0.05 | 6.0 |
| `ui/app/vite.sw.config.ts` | 95.4 | 0 | 1 | 0% | 0.06 | 6.0 |
| `ui/app/playwright/utils/errorExitReporter.ts` | 98.8 | 0 | 0 | 0% | 0.17 | 6.0 |
| `ui/library/src/components/atoms/badge/AtomBadge.tsx` | 92.5 | 6 | 2 | 0% | 0.12 | 5.1 |
| `ui/app/src/utils/local-first/query_snapshots/querySnapshotFetch.ts` | 92.6 | 10 | 2 | 0% | 0.13 | 5.1 |
| `ui/library/src/components/atoms/combobox/AtomCombobox.tsx` | 93.0 | 9 | 1 | 0% | 0.14 | 5.1 |
| `ui/app/src/utils/service-worker/pending_tasks/processPendingTasksInBackground.ts` | 93.9 | 2 | 1 | 0% | 0.11 | 5.1 |
| `ui/app/src/services/secured/collection-crud/collectionCrudOfflineUtils.ts` | 87.3 | 2 | 8 | 0% | 0.13 | 4.9 |
| `ui/app/src/routes/stages/enroll.competitor.spec.ts` | 88.8 | 0 | 4 | 0% | 0.16 | 4.9 |
| `ui/app/src/utils/http/query-client.ts` | 89.4 | 23 | 3 | 0% | 0.17 | 4.9 |
| `ui/app/src/utils/event.ts` | 89.9 | 14 | 2 | 0% | 0.19 | 4.9 |
| `ui/app/playwright/api-mocks/dogs.ts` | 90.0 | 6 | 3 | 0% | 0.15 | 4.9 |
| `ui/app/playwright/api-mocks/collections.ts` | 90.3 | 4 | 4 | 0% | 0.11 | 4.9 |
| `ui/app/src/components/common/floating-toggle-circle/FloatingToggleCircle.tsx` | 90.3 | 7 | 3 | 0% | 0.24 | 4.9 |
| `ui/app/src/routes/my/dogs/list/dogs.organizer.spec.ts` | 90.6 | 0 | 3 | 0% | 0.13 | 4.9 |
| `ui/app/src/utils/date.ts` | 90.9 | 16 | 1 | 0% | 0.21 | 4.9 |
| `ui/app/src/utils/google-auth/googleAuth.ts` | 91.4 | 6 | 2 | 0% | 0.14 | 4.9 |
| `ui/library/src/components/atoms/button/AtomButton.tsx` | 91.5 | 43 | 1 | 0% | 0.19 | 4.9 |
| `ui/library/src/components/atoms/popover/AtomPopover.test.tsx` | 92.1 | 0 | 1 | 0% | 0.17 | 4.9 |
| `ui/app/src/utils/layout/useViewportFillHeight.ts` | 92.4 | 6 | 1 | 0% | 0.17 | 4.9 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-badge/PositionBadge.tsx` | 92.6 | 1 | 3 | 0% | 0.07 | 4.9 |
| `ui/library/src/components/atoms/dialog/AtomDialog.test.tsx` | 92.7 | 0 | 1 | 0% | 0.15 | 4.9 |
| `ui/app/src/utils/media-query/useDeviceType.ts` | 94.8 | 8 | 1 | 0% | 0.25 | 4.9 |
| `ui/app/playwright/utils/localFirst.ts` | 94.9 | 15 | 0 | 0% | 0.17 | 4.9 |
| `ui/app/src/utils/logger/logger.ts` | 95.2 | 3 | 0 | 0% | 0.23 | 4.9 |
| `ui/library/src/components/atoms/svg-icon/AtomSvgIcon.tsx` | 95.4 | 28 | 1 | 0% | 0.10 | 4.9 |
| `ui/library/src/components/atoms/dialog/AtomDialog.tsx` | 95.7 | 20 | 1 | 0% | 0.05 | 4.9 |
| `ui/app/src/utils/google-forms/postGoogleForm.ts` | 96.3 | 5 | 0 | 0% | 0.17 | 4.9 |
| `ui/app/src/routeTree.gen.ts` | 85.3 | 1 | 28 | 0% | 0.04 | 2.0 |
| `ui/app/src/routes/my/collections/$id/route.test.tsx` | 86.8 | 0 | 6 | 0% | 0.18 | 2.9 |
| `ui/app/src/routes/my/competitions/list/index.test.tsx` | 86.9 | 0 | 4 | 0% | 0.26 | 1.2 |
| `ui/app/src/utils/local-first/query_snapshots/querySnapshotsStore.test.ts` | 87.3 | 0 | 3 | 0% | 0.24 | 1.2 |
| `ui/app/playwright/api-mocks/dogById.ts` | 94.3 | 1 | 1 | 0% | 0.45 | 4.1 |
| `ui/app/src/utils/service-worker/pending_tasks/backgroundSync.ts` | 94.3 | 5 | 0 | 0% | 0.19 | 4.1 |
| `ui/app/src/utils/local-first/pending_tasks/commitOptimisticMutation.test.ts` | 88.1 | 0 | 7 | 0% | 0.12 | 2.9 |
| `ui/app/playwright/utils/authFixtures.ts` | 89.3 | 25 | 7 | 0% | 0.08 | 1.2 |
| `ui/app/src/services/secured/fetch-user-data/fetchUserData.ts` | 89.3 | 3 | 6 | 0% | 0.14 | 1.2 |
| `ui/app/src/utils/local-first/query_snapshots/querySnapshotsStore.ts` | 89.7 | 13 | 3 | 0% | 0.16 | 2.9 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxCompetitorHeader.test.tsx` | 89.7 | 0 | 3 | 0% | 0.16 | 1.2 |
| `ui/library/src/components/molecules/carousel/Carousel.tsx` | 89.9 | 2 | 2 | 0% | 0.19 | 2.9 |
| `ui/app/src/utils/http/query-factory.ts` | 89.9 | 12 | 2 | 0% | 0.19 | 2.0 |
| `ui/app/src/components/routes/my/competitions/list/competition-card/CompetitionCard.tsx` | 90.0 | 2 | 8 | 0% | 0.04 | 1.2 |
| `ui/app/playwright/utils/defaultApiResponses.ts` | 90.1 | 1 | 10 | 0% | 0.01 | 1.2 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxCompetitorHeader.tsx` | 90.2 | 2 | 9 | 0% | 0.02 | 1.2 |
| `ui/app/playwright/api-mocks/judges.ts` | 90.5 | 3 | 2 | 0% | 0.17 | 2.9 |
| `ui/app/src/utils/local-first/query_snapshots/querySnapshotFetch.test.ts` | 90.6 | 0 | 3 | 0% | 0.13 | 1.2 |
| `ui/library/src/components/atoms/checkbox/AtomCheckbox.test.tsx` | 90.6 | 0 | 1 | 0% | 0.22 | 1.2 |
| `ui/app/src/routes/my/collections/fill.competitor.spec.ts` | 90.9 | 0 | 3 | 0% | 0.13 | 1.2 |
| `ui/app/src/routes/my/collections/not-competing.competitor.spec.ts` | 90.9 | 0 | 3 | 0% | 0.12 | 1.2 |
| `ui/app/src/utils/local-first/localFirstPolicy.ts` | 94.0 | 22 | 0 | 0% | 0.53 | 3.0 |
| `ui/app/src/utils/filter/nameFilter.ts` | 96.4 | 4 | 0 | 0% | 0.40 | 3.0 |
| `ui/library/src/components/atoms/image/AtomImage.tsx` | 98.2 | 3 | 0 | 0% | 0.12 | 3.0 |
| `ui/app/src/components/routes/my/collections/list/collection-card/CollectionCard.tsx` | 91.1 | 1 | 7 | 0% | 0.02 | 2.0 |
| `ui/app/src/components/routes/my/dogs/list/dog-card/DogCard.tsx` | 91.1 | 1 | 7 | 0% | 0.02 | 2.0 |
| `ui/app/src/components/routes/my/judges/list/judge-card/JudgeCard.tsx` | 91.1 | 1 | 7 | 0% | 0.02 | 2.0 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/ObdxClassificationCard.tsx` | 91.1 | 1 | 7 | 0% | 0.02 | 2.0 |
| `ui/app/src/routes/my/dogs/list/dogs.competitor.spec.ts` | 91.2 | 0 | 3 | 0% | 0.11 | 1.2 |
| `ui/app/src/routes/my/judges/list/judges.organizer.spec.ts` | 91.2 | 0 | 3 | 0% | 0.11 | 1.2 |
| `ui/app/src/components/common/discipline-icon/DisciplineIcon.tsx` | 92.0 | 10 | 2 | 0% | 0.17 | 2.9 |
| `ui/app/src/routes/stages/index.logged-out.spec.ts` | 92.4 | 0 | 3 | 0% | 0.07 | 2.9 |
| `ui/app/src/components/common/status-badge/StatusBadge.tsx` | 92.6 | 12 | 2 | 0% | 0.12 | 2.9 |
| `ui/app/src/utils/service-worker/pending_tasks/backgroundSync.test.ts` | 93.3 | 0 | 1 | 0% | 0.13 | 2.9 |
| `ui/library/src/components/atoms/segmented-control/AtomSegmentedControl.test.tsx` | 93.6 | 0 | 1 | 0% | 0.12 | 2.9 |
| `ui/app/src/components/common/card-list-skeleton/CardListSkeleton.tsx` | 93.7 | 5 | 2 | 0% | 0.07 | 2.9 |
| `ui/library/src/components/molecules/circle-button/CircleButton.tsx` | 93.8 | 10 | 2 | 0% | 0.09 | 2.9 |
| `ui/app/src/utils/service-worker/offline_bundle/warmOfflineBundle.test.ts` | 94.5 | 0 | 1 | 0% | 0.09 | 2.9 |
| `ui/library/src/components/atoms/segmented-control/AtomSegmentedControl.tsx` | 95.1 | 12 | 1 | 0% | 0.07 | 2.9 |
| `ui/app/src/utils/local-first/storage/localFirstDatabase.ts` | 96.5 | 5 | 0 | 0% | 0.12 | 2.9 |
| `ui/library/src/utils/tagColor.ts` | 97.6 | 1 | 0 | 0% | 0.12 | 2.9 |
| `ui/app/src/routes/my/collections/red-card.competitor.spec.ts` | 91.5 | 0 | 3 | 0% | 0.10 | 1.2 |
| `ui/app/src/routes/my/collections/yellow-card.competitor.spec.ts` | 91.5 | 0 | 3 | 0% | 0.10 | 1.2 |
| `ui/app/src/routes/my/competitions/eventDetailExercises.organizer.spec.ts` | 91.5 | 0 | 3 | 0% | 0.10 | 1.2 |
| `ui/app/src/routes/my/competitions/eventDetailJudges.organizer.spec.ts` | 91.5 | 0 | 3 | 0% | 0.10 | 1.2 |
| `ui/app/src/routes/my/competitions/stages.organizer.spec.ts` | 91.5 | 0 | 3 | 0% | 0.10 | 1.2 |
| `ui/library/src/components/atoms/image/AtomImage.test.tsx` | 91.5 | 0 | 1 | 0% | 0.19 | 1.2 |
| `ui/library/src/components/molecules/profile-image/ProfileImage.test.tsx` | 91.5 | 0 | 1 | 0% | 0.19 | 1.2 |
| `ui/app/src/app.tsx` | 91.7 | 0 | 5 | 0% | 0.07 | 2.0 |
| `ui/app/src/routes/my/competitions/competitions.organizer.spec.ts` | 91.8 | 0 | 3 | 0% | 0.09 | 1.2 |
| `ui/app/src/routes/my/competitions/events.organizer.spec.ts` | 91.8 | 0 | 3 | 0% | 0.09 | 1.2 |
| `ui/app/src/services/secured/red-card-crud/redCardCrud.ts` | 91.8 | 1 | 4 | 0% | 0.09 | 1.2 |
| `ui/app/src/services/secured/yellow-card-crud/yellowCardCrud.ts` | 91.8 | 1 | 4 | 0% | 0.09 | 1.2 |
| `ui/library/src/components/atoms/input/AtomInput.test.tsx` | 91.8 | 0 | 1 | 0% | 0.22 | 1.2 |
| `ui/library/src/components/atoms/skeleton/AtomSkeleton.test.tsx` | 91.8 | 0 | 1 | 0% | 0.22 | 1.2 |
| `ui/library/src/components/atoms/text-area/AtomTextArea.test.tsx` | 91.8 | 0 | 1 | 0% | 0.22 | 1.2 |
| `ui/library/src/components/molecules/circle-button/CircleButton.test.tsx` | 91.9 | 0 | 1 | 0% | 0.18 | 1.2 |
| `ui/app/src/routes/my/competitions/eventDetail.organizer.spec.ts` | 92.0 | 0 | 3 | 0% | 0.09 | 1.2 |
| `ui/app/src/routes/index.logged-out.spec.ts` | 92.1 | 0 | 3 | 0% | 0.11 | 1.2 |
| `ui/app/src/routes/my/competitions/eventDetailCompetitors.organizer.spec.ts` | 92.1 | 0 | 3 | 0% | 0.08 | 1.2 |
| `ui/app/src/routes/stages/index.filters.spec.ts` | 92.1 | 0 | 4 | 0% | 0.05 | 1.2 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseSquares.tsx` | 92.3 | 2 | 4 | 0% | 0.06 | 2.0 |
| `ui/app/src/utils/local-first/query_snapshots/localFirstQueryCache.ts` | 92.4 | 2 | 4 | 0% | 0.13 | 2.0 |
| `ui/app/src/utils/classification-pdf.test.ts` | 92.4 | 0 | 3 | 0% | 0.07 | 1.2 |
| `ui/app/src/utils/http/query-client.test.ts` | 92.4 | 0 | 3 | 0% | 0.07 | 1.2 |
| `ui/library/src/components/atoms/number-input/AtomNumberInput.test.tsx` | 92.4 | 0 | 1 | 0% | 0.16 | 1.2 |
| `ui/library/src/components/molecules/carousel/Carousel.test.tsx` | 92.4 | 0 | 1 | 0% | 0.16 | 1.2 |
| `ui/app/src/components/common/award-badges/AwardBadges.tsx` | 92.7 | 4 | 3 | 0% | 0.08 | 1.2 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-medal/PositionMedal.tsx` | 92.7 | 2 | 3 | 0% | 0.09 | 1.2 |
| `ui/app/src/utils/local-first/pending_tasks/pendingTasksRunner.test.ts` | 92.7 | 0 | 3 | 0% | 0.06 | 1.2 |
| `ui/app/src/services/secured/competition-crud/competitionDraftStore.test.ts` | 92.9 | 0 | 2 | 0% | 0.09 | 1.2 |
| `ui/app/src/utils/service-worker/pending_tasks/processPendingTasksInBackground.test.ts` | 92.9 | 0 | 2 | 0% | 0.09 | 1.2 |
| `ui/app/src/stores/toast/toast.ts` | 93.0 | 8 | 1 | 0% | 0.27 | 2.0 |
| `ui/library/src/components/atoms/table/AtomTable.test.tsx` | 93.0 | 0 | 1 | 0% | 0.14 | 1.2 |
| `ui/app/src/components/routes/my/collections/$id/obdx/scores-competitor-pre-label/ScoresCompetitorPreLabel.tsx` | 93.0 | 2 | 4 | 0% | 0.03 | 1.0 |
| `ui/library/src/components/atoms/badge/AtomBadge.stories.tsx` | 93.2 | 0 | 2 | 0% | 0.08 | 2.0 |
| `ui/app/src/services/secured/do-login/doLogin.ts` | 93.3 | 1 | 3 | 0% | 0.14 | 2.0 |
| `ui/library/src/components/molecules/carousel/Carousel.stories.tsx` | 93.3 | 0 | 3 | 0% | 0.05 | 2.0 |
| `ui/library/src/components/atoms/select/AtomSelect.test.tsx` | 93.3 | 0 | 1 | 0% | 0.13 | 1.2 |
| `ui/library/src/components/molecules/card/Card.stories.tsx` | 93.6 | 0 | 3 | 0% | 0.03 | 2.0 |
| `ui/app/src/stores/i18n/i18n.test.ts` | 93.7 | 0 | 1 | 0% | 0.17 | 1.2 |
| `ui/app/src/components/common/info-icon/InfoIcon.tsx` | 93.8 | 1 | 3 | 0% | 0.07 | 2.0 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/red-card-indicator/RedCardIndicator.tsx` | 93.8 | 1 | 3 | 0% | 0.06 | 2.0 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/yellow-card-indicator/YellowCardIndicator.tsx` | 93.8 | 1 | 3 | 0% | 0.06 | 2.0 |
| `ui/app/src/routes/stages/$id/events/$eventId/route.tsx` | 93.8 | 1 | 2 | 0% | 0.13 | 2.0 |
| `ui/library/src/components/atoms/button/AtomButton.stories.tsx` | 93.8 | 0 | 2 | 0% | 0.06 | 2.0 |
| `ui/app/src/components/common/bih-indicator/BihIndicator.tsx` | 93.8 | 3 | 3 | 0% | 0.07 | 1.2 |
| `ui/app/src/components/common/reserve-indicator/ReserveIndicator.tsx` | 93.8 | 3 | 3 | 0% | 0.07 | 1.2 |
| `ui/app/src/components/common/rotate-device-hint/RotateDeviceHint.tsx` | 93.9 | 1 | 3 | 0% | 0.05 | 2.0 |
| `ui/library/src/components/atoms/skeleton/AtomSkeleton.stories.tsx` | 94.1 | 0 | 2 | 0% | 0.05 | 2.0 |
| `ui/library/src/components/atoms/collapsible/AtomCollapsible.stories.tsx` | 94.3 | 0 | 2 | 0% | 0.07 | 2.0 |
| `ui/library/src/components/atoms/dialog/AtomDialog.stories.tsx` | 94.3 | 0 | 2 | 0% | 0.07 | 2.0 |
| `ui/library/src/components/molecules/circle-button/CircleButton.stories.tsx` | 94.3 | 0 | 2 | 0% | 0.06 | 2.0 |
| `ui/library/src/components/atoms/popover/AtomPopover.stories.tsx` | 94.4 | 0 | 2 | 0% | 0.07 | 2.0 |
| `ui/library/src/components/atoms/svg-icon/AtomSvgIcon.stories.tsx` | 94.4 | 0 | 2 | 0% | 0.08 | 2.0 |
| `ui/library/src/components/atoms/tabs/AtomTabs.stories.tsx` | 94.4 | 0 | 2 | 0% | 0.04 | 2.0 |
| `ui/library/src/components/atoms/text-area/AtomTextArea.stories.tsx` | 94.4 | 0 | 2 | 0% | 0.07 | 2.0 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/tag-list/TagList.tsx` | 94.5 | 1 | 2 | 0% | 0.08 | 2.0 |
| `ui/library/src/components/atoms/image/AtomImage.stories.tsx` | 94.5 | 0 | 2 | 0% | 0.08 | 2.0 |
| `ui/library/src/components/atoms/input/AtomInput.stories.tsx` | 94.5 | 0 | 2 | 0% | 0.07 | 2.0 |
| `ui/library/src/components/atoms/number-input/AtomNumberInput.stories.tsx` | 94.5 | 0 | 2 | 0% | 0.06 | 2.0 |
| `ui/library/src/components/molecules/profile-image/ProfileImage.stories.tsx` | 94.5 | 0 | 2 | 0% | 0.08 | 2.0 |
| `ui/library/src/components/atoms/segmented-control/AtomSegmentedControl.stories.tsx` | 94.7 | 0 | 2 | 0% | 0.03 | 2.0 |
| `ui/library/src/components/atoms/select/AtomSelect.stories.tsx` | 94.7 | 0 | 2 | 0% | 0.03 | 2.0 |
| `ui/app/src/components/global/toast/Toast.tsx` | 95.0 | 1 | 2 | 0% | 0.06 | 2.0 |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/pin-button/PinButton.tsx` | 95.0 | 2 | 2 | 0% | 0.04 | 2.0 |
| `ui/app/src/routes/__root.tsx` | 95.0 | 1 | 2 | 0% | 0.05 | 2.0 |
| `ui/app/src/services/secured/dog-crud/dogCrudConstants.ts` | 95.4 | 2 | 1 | 0% | 0.19 | 2.0 |
| `ui/library/.storybook/components/token_table/TokenTable.tsx` | 95.5 | 2 | 1 | 0% | 0.06 | 2.0 |
| `ui/app/src/routes/my/collections/route.tsx` | 96.0 | 1 | 1 | 0% | 0.10 | 2.0 |
| `ui/app/src/routes/my/competitions/route.tsx` | 96.0 | 1 | 1 | 0% | 0.10 | 2.0 |
| `ui/app/src/routes/my/dogs/route.tsx` | 96.0 | 1 | 1 | 0% | 0.10 | 2.0 |
| `ui/app/src/routes/my/judges/route.tsx` | 96.0 | 1 | 1 | 0% | 0.10 | 2.0 |
| `ui/app/src/routes/stages/route.tsx` | 96.0 | 1 | 1 | 0% | 0.10 | 2.0 |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/EventDetailSkeleton.tsx` | 96.3 | 2 | 1 | 0% | 0.03 | 2.0 |
| `ui/app/src/entry-server.tsx` | 96.3 | 0 | 1 | 0% | 0.03 | 2.0 |
| `ui/app/playwright/global-setup.ts` | 96.6 | 0 | 1 | 0% | 0.14 | 2.0 |
| `ui/app/playwright/global-teardown.ts` | 96.6 | 0 | 1 | 0% | 0.13 | 2.0 |
| `ui/app/src/services/secured/breed-crud/breedCrudConstants.ts` | 96.6 | 1 | 1 | 0% | 0.17 | 2.0 |
| `ui/app/src/services/secured/country-crud/countryCrudConstants.ts` | 96.6 | 1 | 1 | 0% | 0.14 | 2.0 |
| `ui/app/src/services/secured/do-logout/doLogout.ts` | 96.6 | 1 | 1 | 0% | 0.05 | 2.0 |
| `ui/app/src/services/secured/judge-crud/judgeCrudConstants.ts` | 96.6 | 2 | 1 | 0% | 0.17 | 2.0 |
| `ui/library/src/components/atoms/logo/AtomLogo.tsx` | 96.6 | 1 | 1 | 0% | 0.05 | 2.0 |
| `ui/app/smoke/utils/constants.ts` | 97.6 | 4 | 0 | 0% | 0.14 | 2.0 |
| `configuration/my-vitest/vitest.config.ts` | 99.4 | 2 | 0 | 0% | 0.02 | 2.0 |
| `coverage_processor/unit_coverage_processor.ts` | 99.4 | 0 | 0 | 0% | 0.02 | 2.0 |
| `coverage_processor/unit_jUnit_processor.ts` | 99.4 | 0 | 0 | 0% | 0.06 | 2.0 |
| `ui/app/src/components/common/page-seo/PageSeo.tsx` | 99.4 | 4 | 0 | 0% | 0.06 | 2.0 |
| `ui/app/src/routes/my/collections/index.tsx` | 99.4 | 1 | 0 | 0% | 0.10 | 2.0 |
| `ui/app/src/routes/my/competitions/index.tsx` | 99.4 | 1 | 0 | 0% | 0.10 | 2.0 |
| `ui/app/src/routes/my/dogs/index.tsx` | 99.4 | 1 | 0 | 0% | 0.10 | 2.0 |
| `ui/app/src/routes/my/judges/index.tsx` | 99.4 | 1 | 0 | 0% | 0.10 | 2.0 |
| `ui/library/.storybook/renderSolid.ts` | 99.4 | 21 | 0 | 0% | 0.11 | 2.0 |
| `ui/library/src/components/atoms/svg-icon/AtomSvgIcon.test.tsx` | 94.1 | 0 | 1 | 0% | 0.19 | 1.2 |
| `ui/app/src/utils/local-first/localFirstPolicy.test.ts` | 94.2 | 0 | 1 | 0% | 0.11 | 1.2 |
| `ui/library/src/components/atoms/badge/AtomBadge.test.tsx` | 94.2 | 0 | 1 | 0% | 0.21 | 1.2 |
| `ui/library/src/components/atoms/combobox/AtomCombobox.test.tsx` | 94.2 | 0 | 1 | 0% | 0.10 | 1.2 |
| `ui/app/playwright/api-mocks/awards.ts` | 94.4 | 2 | 2 | 0% | 0.11 | 1.2 |
| `ui/app/playwright/utils/testFixture.ts` | 94.4 | 2 | 2 | 0% | 0.06 | 1.2 |
| `ui/app/smoke/app-flows.smoke.spec.ts` | 94.4 | 0 | 2 | 0% | 0.04 | 1.2 |
| `ui/app/src/components/common/floating-share-button/FloatingShareButton.competitor.spec.ts` | 94.4 | 0 | 2 | 0% | 0.17 | 1.2 |
| `ui/app/src/components/common/floating-share-button/FloatingShareButton.logged-out.spec.ts` | 94.4 | 0 | 2 | 0% | 0.15 | 1.2 |
| `ui/app/src/routes/index.competitor.spec.ts` | 94.4 | 0 | 2 | 0% | 0.07 | 1.2 |
| `ui/app/src/services/secured/crudOfflineShared.ts` | 94.4 | 5 | 2 | 0% | 0.06 | 1.2 |
| `ui/app/src/routes/my/judges/list/judges.filter.spec.ts` | 94.5 | 0 | 2 | 0% | 0.06 | 1.2 |
| `ui/library/src/components/atoms/collapsible/AtomCollapsible.test.tsx` | 94.5 | 0 | 1 | 0% | 0.09 | 1.2 |
| `ui/library/src/components/atoms/tabs/AtomTabs.tsx` | 94.5 | 4 | 1 | 0% | 0.09 | 1.2 |
| `ui/app/src/utils/google-forms/postGoogleForm.test.ts` | 94.7 | 0 | 1 | 0% | 0.09 | 1.2 |
| `ui/app/src/utils/store/createAppStore.ts` | 94.8 | 4 | 1 | 0% | 0.17 | 1.2 |
| `ui/library/src/components/atoms/tabs/AtomTabs.test.tsx` | 94.8 | 0 | 1 | 0% | 0.08 | 1.2 |
| `ui/app/src/components/common/name-filter/NameFilter.tsx` | 94.9 | 3 | 2 | 0% | 0.05 | 1.2 |
| `ui/library/src/components/molecules/profile-image/ProfileImage.tsx` | 94.9 | 3 | 2 | 0% | 0.05 | 1.0 |
| `ui/app/src/components/common/not-competing-indicator/NotCompetingIndicator.tsx` | 95.0 | 3 | 2 | 0% | 0.04 | 1.2 |
| `ui/app/src/routes/index.spec.ts` | 95.0 | 0 | 2 | 0% | 0.10 | 1.2 |
| `ui/app/playwright/api-mocks/breeds.ts` | 95.0 | 2 | 2 | 0% | 0.05 | 1.0 |
| `ui/app/playwright/api-mocks/countries.ts` | 95.0 | 1 | 2 | 0% | 0.05 | 1.0 |
| `ui/app/src/utils/service-worker/offline_bundle/offlinePreloadManifest.test.ts` | 95.3 | 0 | 1 | 0% | 0.07 | 1.2 |
| `ui/library/src/components/atoms/button/AtomButton.test.tsx` | 95.4 | 0 | 1 | 0% | 0.30 | 1.2 |
| `ui/app/src/services/secured/collection-crud/collectionCrudConstants.ts` | 95.5 | 2 | 1 | 0% | 0.21 | 1.0 |
| `ui/app/src/routes/my/competitions/list/competitions.filter.spec.ts` | 96.0 | 0 | 1 | 0% | 0.04 | 1.2 |
| `ui/app/src/routes/my/dogs/list/dogs.filter.spec.ts` | 96.0 | 0 | 1 | 0% | 0.07 | 1.2 |
| `ui/app/src/services/secured/award-crud/awardCrudConstants.ts` | 96.0 | 1 | 1 | 0% | 0.20 | 1.0 |
| `ui/library/src/components/molecules/card/Card.tsx` | 96.5 | 18 | 1 | 0% | 0.03 | 1.2 |
| `ui/app/src/components/common/page/Page.tsx` | 96.6 | 6 | 1 | 0% | 0.04 | 1.2 |
| `ui/library/src/components/atoms/checkbox/AtomCheckbox.tsx` | 96.7 | 6 | 1 | 0% | 0.03 | 1.2 |
| `ui/library/src/components/atoms/collapsible/AtomCollapsible.tsx` | 96.7 | 6 | 1 | 0% | 0.03 | 1.2 |
| `ui/library/src/components/atoms/popover/AtomPopover.tsx` | 96.7 | 3 | 1 | 0% | 0.03 | 1.2 |
| `ui/app/src/utils/media-query/useMediaQuery.ts` | 97.6 | 1 | 0 | 0% | 0.25 | 1.2 |
| `ui/app/src/utils/competition.ts` | 98.8 | 5 | 0 | 0% | 0.13 | 1.2 |
| `ui/app/src/services/secured/competition-crud/competitionCrudConstants.ts` | 96.6 | 3 | 1 | 0% | 0.14 | 1.0 |
| `ui/app/src/utils/id/generateEntityId.ts` | 99.4 | 8 | 0 | 0% | 0.33 | 1.0 |

**Average maintainability index:** 91.6/100

### Hotspots (192 files, since 6 months)

| File | Score | Commits | Churn | Density | Fan-in | Trend |
|:-----|:------|:--------|:------|:--------|:-------|:------|
| `ui/app/src/services/secured/event-crud/eventCrud.ts` | 50.3 | 36 | 919 | 0.36 | 3 | accelerating |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/events/$eventId/index.tsx` | 40.7 | 73 | 3740 | 0.16 | 1 | stable |
| `ui/app/src/routes/stages/$id/events/$eventId/classification.tsx` | 38.5 | 61 | 3016 | 0.15 | 1 | accelerating |
| `ui/app/src/components/routes/my/collections/$id/obdx/ObdxCollectionDetail.tsx` | 29.6 | 30 | 821 | 0.23 | 1 | accelerating |
| `ui/app/src/routes/stages/$id/info.tsx` | 28.9 | 55 | 1584 | 0.13 | 1 | accelerating |
| `ui/app/src/components/routes/my/dogs/list/dog-form/DogForm.tsx` | 27.5 | 28 | 576 | 0.27 | 1 | stable |
| `ui/app/src/routes/stages/index.tsx` | 26.2 | 35 | 2486 | 0.18 | 1 | accelerating |
| `ui/app/src/routes/my/dogs/list/index.tsx` | 24.3 | 40 | 1560 | 0.16 | 1 | accelerating |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/index.tsx` | 22.9 | 52 | 1744 | 0.12 | 1 | stable |
| `ui/app/src/routes/my/competitions/$id/index.tsx` | 22.2 | 34 | 885 | 0.20 | 1 | stable |
| `ui/app/src/services/fetch-stages/fetchStages.ts` | 17.9 | 16 | 376 | 0.36 | 8 | cooling |
| `ui/app/src/services/secured/competition-crud/competitionCrud.ts` | 17.4 | 19 | 558 | 0.25 | 13 | cooling |
| `ui/app/src/services/secured/dog-crud/dogCrud.ts` | 16.8 | 21 | 551 | 0.21 | 5 | stable |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/competitor/EventCompetitorsSection.tsx` | 16.2 | 27 | 1104 | 0.14 | 1 | accelerating |
| `ui/app/playwright/api-mocks/eventDetail.ts` | 15.8 | 15 | 338 | 0.23 | 4 | stable |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/competitor/CompetitorEditorForm.tsx` | 15.4 | 20 | 587 | 0.18 | 1 | accelerating |
| `ui/app/src/utils/event.ts` | 14.5 | 21 | 126 | 0.19 | 14 | stable |
| `ui/app/src/services/secured/stage-crud/stageCrud.ts` | 13.8 | 17 | 453 | 0.22 | 3 | stable |
| `ui/app/src/services/secured/dog-crud/dogCrudOfflineUtils.ts` | 13.6 | 10 | 246 | 0.34 | 2 | stable |
| `ui/app/src/routes/my/judges/list/index.tsx` | 12.4 | 22 | 766 | 0.15 | 1 | stable |
| `ui/app/src/routes/my/collections/$id/route.test.tsx` | 12.3 | 19 | 260 | 0.18 | 0 | stable |
| `ui/app/src/utils/stage.ts` | 12.0 | 11 | 158 | 0.27 | 12 | accelerating |
| `ui/app/src/routes/index.tsx` | 11.4 | 43 | 1145 | 0.09 | 1 | cooling |
| `ui/app/src/utils/http/client.ts` | 10.4 | 19 | 347 | 0.20 | 24 | cooling |
| `ui/app/src/routes/my/competitions/list/index.tsx` | 9.9 | 20 | 551 | 0.13 | 2 | stable |
| `ui/app/src/services/secured/event-crud/eventCrud.types.ts` | 9.3 | 30 | 373 | 0.08 | 21 | stable |
| `ui/app/src/components/routes/stages/stages-map/StageMapMarker.tsx` | 8.7 | 27 | 791 | 0.08 | 1 | accelerating |
| `ui/app/src/components/global/app-shell/AppShell.tsx` | 8.3 | 32 | 268 | 0.07 | 1 | stable |
| `ui/app/src/components/routes/my/competitions/$id/stages-section/StagesSection.tsx` | 8.3 | 19 | 542 | 0.13 | 1 | stable |
| `ui/app/src/components/routes/my/collections/$id/obdx/yellow-card/YellowCardDialog.tsx` | 8.0 | 11 | 492 | 0.16 | 1 | cooling |
| `ui/app/src/components/common/event-discipline-field/EventDisciplineField.tsx` | 7.4 | 8 | 86 | 0.23 | 1 | accelerating |
| `ui/app/src/components/routes/stages/stages-map/StagesMap.tsx` | 7.3 | 9 | 1078 | 0.23 | 1 | stable |
| `ui/app/src/routes/auth/callback.tsx` | 7.3 | 24 | 332 | 0.11 | 1 | cooling |
| `ui/app/src/components/common/country-flag/CountryFlag.tsx` | 7.2 | 9 | 1208 | 0.20 | 22 | accelerating |
| `ui/app/src/components/routes/my/competitions/$id/stages-section/StageEditorForm.tsx` | 7.1 | 11 | 247 | 0.21 | 1 | cooling |
| `ui/app/src/services/secured/judge-crud/judgeCrud.ts` | 6.7 | 8 | 252 | 0.23 | 3 | cooling |
| `ui/app/src/components/routes/my/judges/list/judge-form/JudgeForm.tsx` | 6.7 | 9 | 128 | 0.25 | 1 | cooling |
| `ui/app/src/components/global/app-shell/layout/AppLayout.tsx` | 6.7 | 18 | 328 | 0.10 | 1 | stable |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/configuration/ConfigurationEditorForm.tsx` | 6.6 | 7 | 195 | 0.25 | 1 | cooling |
| `ui/app/src/components/global/app-shell/layout/navigation/NavigationUserMenu.tsx` | 6.6 | 18 | 331 | 0.10 | 1 | stable |
| `ui/app/src/services/fetch-stages/stageEnroll.ts` | 6.3 | 11 | 454 | 0.16 | 2 | stable |
| `ui/app/src/stores/auth/auth.ts` | 6.2 | 7 | 160 | 0.26 | 27 | cooling |
| `ui/app/src/services/secured/event-crud/eventCrudOfflineUtils.ts` | 6.1 | 9 | 529 | 0.18 | 1 | stable |
| `ui/app/src/components/common/country-field/CountryField.tsx` | 6.1 | 9 | 107 | 0.17 | 3 | accelerating |
| `ui/app/src/utils/date.ts` | 6.1 | 7 | 95 | 0.21 | 16 | accelerating |
| `ui/app/src/services/secured/stage-crud/stageCrudOfflineUtils.ts` | 6.0 | 8 | 434 | 0.19 | 1 | accelerating |
| `ui/app/src/components/routes/stages/stage-card/StageCard.tsx` | 5.9 | 20 | 300 | 0.07 | 1 | accelerating |
| `ui/library/src/components/atoms/button/AtomButton.tsx` | 5.7 | 9 | 100 | 0.19 | 43 | stable |
| `ui/app/src/components/routes/stages/stages-filters/StagesFilters.tsx` | 5.5 | 7 | 308 | 0.17 | 1 | stable |
| `ui/app/playwright/api-mocks/collections.ts` | 5.5 | 11 | 216 | 0.11 | 4 | stable |
| `ui/app/src/components/routes/my/competitions/$id/competition-info/CompetitionInfo.tsx` | 5.3 | 12 | 275 | 0.13 | 1 | stable |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxCompetitorHeader.test.tsx` | 5.3 | 7 | 54 | 0.16 | 0 | cooling |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseDetailTable.tsx` | 5.2 | 9 | 197 | 0.13 | 1 | accelerating |
| `ui/app/src/services/secured/judge-crud/judgeDraftStore.ts` | 5.1 | 4 | 115 | 0.39 | 2 | cooling |
| `ui/app/src/components/global/app-shell/layout/AppBreadcrumbs.tsx` | 5.1 | 7 | 200 | 0.20 | 1 | stable |
| `ui/app/playwright/api-mocks/dogs.ts` | 5.0 | 8 | 115 | 0.15 | 6 | accelerating |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/judges/JudgeEditorForm.tsx` | 4.9 | 6 | 177 | 0.20 | 1 | accelerating |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/judges/EventJudgesSection.tsx` | 4.9 | 8 | 382 | 0.15 | 1 | accelerating |
| `ui/app/src/routes/my/collections/$id/route.tsx` | 4.9 | 18 | 882 | 0.09 | 2 | cooling |
| `ui/app/src/services/secured/judge-crud/judgeCrudOfflineUtils.ts` | 4.4 | 5 | 318 | 0.25 | 1 | cooling |
| `ui/app/src/components/routes/my/collections/$id/obdx/red-card/RedCardDialog.tsx` | 4.1 | 6 | 226 | 0.15 | 1 | cooling |
| `ui/library/src/components/atoms/table/AtomTable.tsx` | 4.0 | 5 | 274 | 0.20 | 12 | cooling |
| `ui/app/playwright/api-mocks/competitions.ts` | 4.0 | 5 | 308 | 0.18 | 4 | cooling |
| `ui/app/src/services/secured/configurations/configurations.ts` | 4.0 | 6 | 93 | 0.21 | 5 | stable |
| `ui/app/src/routes/my/collections/list/index.tsx` | 3.9 | 12 | 177 | 0.09 | 1 | stable |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/event-editor-form/EventEditorForm.tsx` | 3.8 | 15 | 188 | 0.09 | 1 | cooling |
| `ui/library/src/components/atoms/select/AtomSelect.tsx` | 3.8 | 8 | 221 | 0.15 | 21 | cooling |
| `ui/library/src/components/atoms/combobox/AtomCombobox.tsx` | 3.8 | 8 | 336 | 0.14 | 9 | cooling |
| `ui/app/src/components/common/floating-toggle-circle/FloatingToggleCircle.tsx` | 3.8 | 4 | 50 | 0.24 | 7 | accelerating |
| `ui/app/src/utils/http/query-factory.ts` | 3.8 | 9 | 262 | 0.19 | 12 | cooling |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/exercises/EventExercisesSection.tsx` | 3.6 | 6 | 417 | 0.14 | 1 | accelerating |
| `ui/app/src/services/secured/competition-crud/competitionCrudOfflineUtils.ts` | 3.5 | 5 | 268 | 0.18 | 5 | stable |
| `ui/app/src/utils/classification-pdf.ts` | 3.4 | 5 | 129 | 0.14 | 2 | cooling |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/exercises/ExerciseEditorForm.tsx` | 3.4 | 6 | 323 | 0.13 | 1 | accelerating |
| `ui/app/src/utils/service-worker/events/runtime-cache.ts` | 3.3 | 4 | 220 | 0.20 | 1 | accelerating |
| `ui/app/src/routes/stages/$id/events/$eventId/classification.list-order.spec.ts` | 3.3 | 5 | 107 | 0.14 | 0 | cooling |
| `ui/app/src/services/secured/competition-crud/competitionDraftStore.ts` | 3.3 | 3 | 133 | 0.32 | 5 | cooling |
| `ui/app/src/stores/i18n/i18n.ts` | 3.3 | 4 | 129 | 0.23 | 92 | stable |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils.ts` | 3.2 | 3 | 104 | 0.29 | 8 | cooling |
| `ui/app/src/services/secured/collection-crud/collectionCrud.ts` | 3.1 | 6 | 352 | 0.18 | 7 | stable |
| `ui/app/src/components/common/discipline-icon/DisciplineIcon.tsx` | 3.1 | 4 | 94 | 0.17 | 10 | stable |
| `ui/app/src/components/routes/stages/stage-card/StageCardEventsContent.tsx` | 3.0 | 9 | 203 | 0.07 | 2 | cooling |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/score-chip/ScoreChip.tsx` | 2.9 | 5 | 62 | 0.13 | 2 | accelerating |
| `ui/app/src/components/common/rank-badge/RankBadge.tsx` | 2.9 | 4 | 59 | 0.15 | 5 | accelerating |
| `ui/app/src/components/common/floating-share-button/FloatingShareButton.tsx` | 2.8 | 4 | 107 | 0.16 | 1 | stable |
| `ui/app/src/components/common/icon-toggle-button/IconToggleButton.tsx` | 2.8 | 3 | 36 | 0.21 | 2 | accelerating |
| `ui/app/src/routes/stages/$id/route.tsx` | 2.8 | 5 | 32 | 0.15 | 1 | stable |
| `ui/app/src/utils/competition.ts` | 2.8 | 5 | 19 | 0.13 | 5 | stable |
| `ui/app/src/utils/local-first/pending_tasks/pendingTasksRunner.ts` | 2.7 | 4 | 186 | 0.21 | 15 | cooling |
| `ui/app/src/routes/my/route.tsx` | 2.7 | 7 | 87 | 0.11 | 1 | cooling |
| `ui/library/src/components/atoms/badge/AtomBadge.tsx` | 2.7 | 6 | 54 | 0.12 | 6 | accelerating |
| `ui/app/src/components/common/status-badge/StatusBadge.tsx` | 2.7 | 5 | 51 | 0.12 | 12 | accelerating |
| `ui/app/smoke/utils/flows.ts` | 2.6 | 5 | 434 | 0.12 | 1 | stable |
| `ui/app/src/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/configuration/EventConfigurationSection.tsx` | 2.6 | 5 | 127 | 0.13 | 1 | stable |
| `ui/app/src/utils/local-first/pending_tasks/pendingTasksStore.ts` | 2.5 | 4 | 159 | 0.20 | 16 | cooling |
| `ui/app/src/components/routes/my/collections/$id/obdx/collection-exercise-scores/CollectionExerciseScores.tsx` | 2.3 | 4 | 124 | 0.16 | 1 | stable |
| `ui/app/src/entry-client.tsx` | 2.3 | 4 | 34 | 0.21 | 0 | cooling |
| `ui/app/src/routes/my/competitions/$id/stages/$stageId/route.tsx` | 2.3 | 4 | 34 | 0.19 | 1 | cooling |
| `ui/library/.storybook/withDarkTheme.decorator.ts` | 2.2 | 4 | 183 | 0.27 | 1 | stable |
| `ui/app/playwright/utils/playwrightMockingUtils.ts` | 2.2 | 3 | 122 | 0.22 | 12 | accelerating |
| `ui/app/src/manifest.ts` | 2.2 | 4 | 51 | 0.17 | 1 | stable |
| `ui/app/src/routes/my/competitions/$id/route.tsx` | 2.2 | 4 | 29 | 0.18 | 1 | cooling |
| `ui/app/src/utils/local-first/pending_tasks/commitOptimisticMutation.ts` | 2.1 | 6 | 112 | 0.11 | 5 | cooling |
| `ui/app/src/app.tsx` | 2.1 | 13 | 230 | 0.07 | 0 | cooling |
| `ui/app/src/services/secured/dog-crud/dogCrudConstants.ts` | 2.1 | 3 | 15 | 0.19 | 2 | cooling |
| `ui/app/src/utils/router/breadcrumbs.ts` | 2.0 | 4 | 47 | 0.14 | 1 | stable |
| `ui/app/src/routes/my/competitions/list/index.test.tsx` | 2.0 | 3 | 44 | 0.26 | 0 | accelerating |
| `ui/library/src/components/atoms/breadcrumbs/AtomBreadcrumbs.tsx` | 1.9 | 5 | 101 | 0.10 | 1 | stable |
| `ui/app/src/utils/http/query-client.ts` | 1.9 | 5 | 75 | 0.17 | 23 | cooling |
| `ui/app/src/utils/local-first/query_snapshots/querySnapshotsStore.ts` | 1.9 | 3 | 110 | 0.16 | 13 | accelerating |
| `ui/library/src/components/atoms/image/AtomImage.tsx` | 1.9 | 6 | 54 | 0.12 | 3 | cooling |
| `ui/app/src/routes/stages/$id/events/$eventId/route.tsx` | 1.9 | 4 | 26 | 0.13 | 1 | stable |
| `ui/app/src/routes/index.spec.ts` | 1.9 | 8 | 27 | 0.10 | 0 | cooling |
| `ui/app/src/utils/google-auth/googleAuth.ts` | 1.8 | 4 | 197 | 0.14 | 6 | stable |
| `ui/app/src/components/routes/my/competitions/list/competition-card/CompetitionCard.tsx` | 1.8 | 12 | 189 | 0.04 | 2 | stable |
| `ui/app/smoke/utils/constants.ts` | 1.8 | 3 | 35 | 0.14 | 4 | cooling |
| `ui/app/src/services/secured/collection-crud/collectionCrudOfflineUtils.ts` | 1.7 | 4 | 291 | 0.13 | 2 | cooling |
| `ui/app/src/utils/local-first/pending_tasks/commitOptimisticMutation.test.ts` | 1.7 | 5 | 245 | 0.12 | 0 | cooling |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-medal/PositionMedal.tsx` | 1.7 | 4 | 48 | 0.09 | 2 | stable |
| `ui/app/vite.config.ts` | 1.6 | 12 | 124 | 0.05 | 0 | cooling |
| `ui/app/src/routes/my/collections/not-competing.competitor.spec.ts` | 1.6 | 3 | 53 | 0.12 | 0 | accelerating |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseSquares.tsx` | 1.6 | 6 | 61 | 0.06 | 2 | accelerating |
| `ui/app/src/utils/notifications/notifications.ts` | 1.5 | 4 | 110 | 0.18 | 2 | cooling |
| `ui/library/.storybook/main.ts` | 1.5 | 7 | 90 | 0.11 | 0 | stable |
| `ui/app/src/components/global/app-shell/layout/navigation/Navigation.tsx` | 1.5 | 9 | 225 | 0.05 | 1 | cooling |
| `ui/app/src/router.tsx` | 1.4 | 6 | 115 | 0.10 | 1 | cooling |
| `ui/library/src/components/atoms/number-input/AtomNumberInput.tsx` | 1.4 | 6 | 87 | 0.07 | 7 | cooling |
| `ui/app/src/components/global/app-shell/layout/navigation/ContactForm.tsx` | 1.4 | 6 | 61 | 0.08 | 2 | cooling |
| `ui/app/src/components/routes/stages/stages-map/WrongLocationForm.tsx` | 1.4 | 6 | 52 | 0.08 | 1 | cooling |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/score-fraction/ScoreFraction.tsx` | 1.4 | 3 | 31 | 0.11 | 1 | accelerating |
| `ui/library/src/components/atoms/svg-icon/AtomSvgIcon.tsx` | 1.4 | 4 | 41 | 0.10 | 28 | stable |
| `ui/app/playwright/utils/authFixtures.ts` | 1.4 | 4 | 139 | 0.08 | 25 | accelerating |
| `ui/app/src/utils/classification-pdf.test.ts` | 1.4 | 4 | 146 | 0.07 | 0 | cooling |
| `ui/app/src/components/common/confirm-action-button/ConfirmActionButton.tsx` | 1.3 | 4 | 70 | 0.13 | 12 | cooling |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-badge/PositionBadge.tsx` | 1.3 | 4 | 87 | 0.07 | 1 | accelerating |
| `ui/library/src/components/atoms/segmented-control/AtomSegmentedControl.test.tsx` | 1.3 | 4 | 188 | 0.12 | 0 | stable |
| `ui/library/src/components/atoms/combobox/AtomCombobox.test.tsx` | 1.3 | 4 | 147 | 0.10 | 0 | cooling |
| `ui/app/src/components/global/app-shell/layout/navigation/OrganizerForm.tsx` | 1.2 | 5 | 50 | 0.08 | 1 | cooling |
| `ui/library/src/components/atoms/combobox/AtomCombobox.stories.tsx` | 1.2 | 4 | 142 | 0.09 | 0 | cooling |
| `ui/app/src/services/secured/fetch-user-data/fetchUserData.ts` | 1.2 | 3 | 42 | 0.14 | 3 | cooling |
| `ui/library/src/components/molecules/circle-button/CircleButton.tsx` | 1.2 | 4 | 37 | 0.09 | 10 | stable |
| `ui/library/src/components/atoms/number-input/AtomNumberInput.test.tsx` | 1.2 | 3 | 73 | 0.16 | 0 | accelerating |
| `ui/library/src/components/atoms/select/AtomSelect.test.tsx` | 1.2 | 4 | 94 | 0.13 | 0 | stable |
| `ui/app/src/routes/my/competitions/route.tsx` | 1.2 | 4 | 22 | 0.10 | 1 | cooling |
| `ui/app/src/routes/my/dogs/route.tsx` | 1.2 | 4 | 22 | 0.10 | 1 | cooling |
| `ui/app/src/routes/my/judges/route.tsx` | 1.2 | 4 | 22 | 0.10 | 1 | cooling |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/ObdxClassificationContent.tsx` | 1.1 | 4 | 82 | 0.06 | 2 | stable |
| `ui/app/src/providers/notifications/NotificationsInit.tsx` | 1.1 | 5 | 76 | 0.10 | 1 | cooling |
| `ui/library/src/components/atoms/input/AtomInput.tsx` | 1.1 | 4 | 64 | 0.08 | 14 | stable |
| `ui/library/src/components/atoms/dialog/AtomDialog.tsx` | 1.1 | 6 | 105 | 0.05 | 20 | stable |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxCompetitorHeader.tsx` | 1.1 | 13 | 88 | 0.02 | 2 | accelerating |
| `ui/library/src/components/atoms/segmented-control/AtomSegmentedControl.tsx` | 1.1 | 5 | 166 | 0.07 | 12 | cooling |
| `ui/app/src/components/common/award-badges/AwardBadges.tsx` | 1.1 | 3 | 54 | 0.08 | 4 | accelerating |
| `ui/app/src/components/routes/my/collections/$id/obdx/scores-competitor-pre-label/ScoresCompetitorPreLabel.tsx` | 1.1 | 9 | 70 | 0.03 | 2 | accelerating |
| `ui/library/src/components/atoms/svg-icon/AtomSvgIcon.stories.tsx` | 1.1 | 4 | 39 | 0.08 | 0 | stable |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/tag-list/TagList.tsx` | 1.1 | 3 | 27 | 0.08 | 1 | accelerating |
| `ui/app/src/routeTree.gen.ts` | 1.0 | 11 | 1094 | 0.04 | 1 | cooling |
| `ui/library/src/components/atoms/badge/AtomBadge.stories.tsx` | 1.0 | 3 | 67 | 0.08 | 0 | accelerating |
| `ui/library/src/components/atoms/button/AtomButton.stories.tsx` | 1.0 | 5 | 76 | 0.06 | 0 | cooling |
| `ui/app/src/routes/my/collections/route.tsx` | 1.0 | 3 | 22 | 0.10 | 1 | cooling |
| `ui/app/src/routes/stages/route.tsx` | 1.0 | 3 | 22 | 0.10 | 1 | cooling |
| `ui/library/src/components/atoms/tabs/AtomTabs.tsx` | 1.0 | 4 | 70 | 0.09 | 4 | cooling |
| `ui/app/src/utils/store/createAppStore.ts` | 1.0 | 3 | 33 | 0.17 | 4 | cooling |
| `ui/app/src/routes/stages/index.filters.spec.ts` | 0.9 | 4 | 627 | 0.05 | 0 | stable |
| `ui/library/src/components/atoms/image/AtomImage.stories.tsx` | 0.9 | 4 | 37 | 0.08 | 0 | cooling |
| `ui/library/src/components/molecules/card/Card.tsx` | 0.9 | 12 | 201 | 0.03 | 18 | cooling |
| `ui/library/src/components/atoms/text-area/AtomTextArea.tsx` | 0.7 | 3 | 62 | 0.08 | 7 | cooling |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/total-block/TotalBlock.tsx` | 0.7 | 3 | 39 | 0.05 | 2 | accelerating |
| `ui/library/src/components/molecules/profile-image/ProfileImage.stories.tsx` | 0.7 | 3 | 31 | 0.08 | 0 | cooling |
| `ui/app/src/routes/__root.tsx` | 0.7 | 6 | 30 | 0.05 | 1 | cooling |
| `ui/app/src/entry-server.tsx` | 0.7 | 7 | 70 | 0.03 | 0 | stable |
| `ui/app/smoke/app-flows.smoke.spec.ts` | 0.7 | 4 | 94 | 0.04 | 0 | stable |
| `ui/library/src/components/atoms/tabs/AtomTabs.test.tsx` | 0.7 | 3 | 79 | 0.08 | 0 | cooling |
| `ui/library/src/components/molecules/profile-image/ProfileImage.tsx` | 0.7 | 5 | 45 | 0.05 | 3 | cooling |
| `ui/app/src/components/routes/my/collections/list/collection-card/CollectionCard.tsx` | 0.6 | 8 | 124 | 0.02 | 1 | accelerating |
| `ui/app/src/components/routes/my/dogs/list/dog-card/DogCard.tsx` | 0.6 | 8 | 75 | 0.02 | 1 | stable |
| `ui/library/src/components/molecules/circle-button/CircleButton.stories.tsx` | 0.6 | 3 | 41 | 0.06 | 0 | cooling |
| `ui/library/src/components/atoms/popover/AtomPopover.stories.tsx` | 0.6 | 3 | 35 | 0.07 | 0 | cooling |
| `ui/library/src/components/atoms/collapsible/AtomCollapsible.test.tsx` | 0.6 | 3 | 65 | 0.09 | 0 | cooling |
| `ui/app/src/components/common/page/Page.tsx` | 0.6 | 3 | 32 | 0.04 | 6 | cooling |
| `ui/app/src/components/routes/my/judges/list/judge-card/JudgeCard.tsx` | 0.5 | 7 | 70 | 0.02 | 1 | stable |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/ObdxClassificationCard.tsx` | 0.5 | 7 | 222 | 0.02 | 1 | stable |
| `ui/app/src/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/pin-button/PinButton.tsx` | 0.5 | 3 | 28 | 0.04 | 2 | accelerating |
| `ui/app/src/utils/service-worker/offline_bundle/offlinePreloadManifest.test.ts` | 0.5 | 3 | 63 | 0.07 | 0 | cooling |
| `ui/app/playwright/utils/testFixture.ts` | 0.4 | 3 | 61 | 0.06 | 2 | accelerating |
| `ui/library/src/components/atoms/popover/AtomPopover.tsx` | 0.4 | 5 | 53 | 0.03 | 3 | cooling |
| `ui/library/src/components/atoms/segmented-control/AtomSegmentedControl.stories.tsx` | 0.3 | 4 | 69 | 0.03 | 0 | stable |
| `ui/library/src/components/atoms/select/AtomSelect.stories.tsx` | 0.3 | 3 | 64 | 0.03 | 0 | cooling |
| `ui/library/src/components/atoms/collapsible/AtomCollapsible.tsx` | 0.3 | 3 | 38 | 0.03 | 6 | cooling |
| `ui/library/src/components/molecules/card/Card.stories.tsx` | 0.2 | 3 | 74 | 0.03 | 0 | cooling |
| `configuration/my-vitest/vitest.config.ts` | 0.2 | 4 | 58 | 0.02 | 2 | cooling |
| `ui/app/playwright/utils/defaultApiResponses.ts` | 0.1 | 4 | 117 | 0.01 | 1 | accelerating |

*141 files excluded (< 3 commits)*

### Refactoring Targets (5)

| Efficiency | Category | Effort / Confidence | File | Recommendation |
|:-----------|:---------|:--------------------|:-----|:---------------|
| 14.2 | high impact | medium / medium | `ui/app/src/services/fetch-stages/fetchStages.ts` | Split high-impact file (145 LOC), 8 dependents amplify every change |
| 12.1 | high impact | high / medium | `ui/app/src/services/secured/event-crud/eventCrud.ts` | Split high-impact file (628 LOC), 3 dependents amplify every change |
| 10.3 | high impact | high / medium | `ui/app/src/utils/local-first/localFirstPolicy.ts` | Split high-impact file (19 LOC), 22 dependents amplify every change |
| 10.3 | untested risk | medium / high | `ui/app/src/services/secured/dog-crud/dogCrudOfflineUtils.ts` | 2 complex functions lack test coverage path, add tests before modifying |
| 8.0 | high impact | medium / medium | `ui/app/src/services/secured/competition-crud/competitionDraftStore.ts` | Split high-impact file (118 LOC), 5 dependents amplify every change |

---

<details><summary>Metric definitions</summary>

- **MI**: Maintainability Index (0–100, higher is better)
- **Order**: risk-aware triage order using the larger of low-MI concern and CRAP risk
- **Fan-in**: files that import this file (blast radius)
- **Fan-out**: files this file imports (coupling)
- **Dead Code**: % of value exports with zero references
- **Density**: cyclomatic complexity / lines of code
- **Risk**: max CRAP score for the file; low <15, moderate 15-30, high >=30
- **Score**: churn × complexity (0–100, higher = riskier)
- **Commits**: commits in the analysis window
- **Churn**: total lines added + deleted
- **Trend**: accelerating / stable / cooling
- **Efficiency**: priority / effort (higher = better quick-win value, default sort)
- **Category**: recommendation type (churn+complexity, high impact, dead code, complexity, coupling, circular dep)
- **Effort**: estimated effort (low / medium / high) based on file size, function count, and fan-in
- **Confidence**: recommendation reliability (high = deterministic analysis, medium = heuristic, low = git-dependent)

[Full metric reference](https://docs.fallow.tools/explanations/metrics)

</details>

