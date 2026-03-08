<script>
    import {auth} from "$lib/stores/auth";
    import {showNotification} from "$lib/stores/notifications";

    const updateNotes = $derived.by(() => $auth?.user?.getNews?.() ?? ["1", "2"]);
    const showUpdateNotes = $derived.by(() => updateNotes.length > 0);
</script>

<div class="Container">
    <div class="Toast2">
        <button class="ToastButton" onclick={showNotification}>
            txomins
        </button>
    </div>

    {#if showUpdateNotes}
        <div class="Toast">
            <div class="ToastMessage">
                {#each updateNotes as note}
                    <div>{note}</div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .Container {
        padding: 0;
        margin: 0;
        width: 0;
        height: 0;
    }

    .Toast {
        position: fixed;
        right: 0;
        bottom: 0;
        margin: 16px;
        padding: 12px;
        border: 1px solid #8885;
        border-radius: 4px;
        z-index: 1;
        text-align: left;
        box-shadow: 3px 4px 5px 0 #8885;
        background-color: white;
    }

    .Toast2 {
        position: fixed;
        right: 0;
        top: 0;
        margin: 16px;
        padding: 12px;
        border: 1px solid #8885;
        border-radius: 4px;
        z-index: 1;
        text-align: left;
        box-shadow: 3px 4px 5px 0 #8885;
        background-color: white;
    }

    .ToastMessage {
        margin-bottom: 8px;
    }

    .ToastButton {
        border: 1px solid #8885;
        outline: none;
        margin-right: 5px;
        border-radius: 2px;
        padding: 3px 10px;
    }
</style>
