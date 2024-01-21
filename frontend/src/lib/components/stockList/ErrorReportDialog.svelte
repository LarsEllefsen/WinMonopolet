<script context="module" lang="ts">
	export type ErrorReportDialog = SvelteComponent & {
		showReportDialog: () => void;
	};
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount, type SvelteComponent } from 'svelte';
	import { ProductErrorType, type VinmonopoletProduct } from '../../../types/product';
	import TextArea from '../textArea/TextArea.svelte';
	import CloseIcon from 'virtual:icons/mdi/close';
	import Select, { type SelectOptions } from '../select/Select.svelte';
	import Input from '../input/Input.svelte';
	import { toast } from '@zerodevx/svelte-toast';

	let formValidation = {
		correctUntappdUrl: { hasError: false, errorMessage: null } as {
			hasError: boolean;
			errorMessage: string | null;
		}
	};

	let product: VinmonopoletProduct | null = null;

	let dialogElement: HTMLDialogElement | undefined;
	let dialogContentElement: Node | undefined;

	let selectedErrorTypeOption: string;
	const errorTypeSelectOptions = [
		{ name: 'Feil øl på Untappd', value: ProductErrorType.WRONG_UNTAPPD.toString() },
		{ name: 'Feil eller manglende info', value: ProductErrorType.WRONG_OR_MISSING_INFO.toString() },
		{ name: 'Utdatert rating', value: ProductErrorType.OUTDATED_RATING.toString() },
		{ name: 'Annet', value: ProductErrorType.OTHER.toString() }
	] as SelectOptions;

	let correctUntappdUrl = '';

	export const showReportDialog = (reportedProduct: VinmonopoletProduct) => {
		product = reportedProduct;
		dialogElement?.showModal();
	};

	const closeReportDialog = () => {
		if (dialogElement) {
			dialogElement.close();
			product = null;
		}
	};

	const addProductInfoToFormData = (formData: FormData) => {
		if (product != null) {
			formData.set('productName', product.vmp_name);
			formData.set('productId', product.vmp_id);
		}

		return formData;
	};

	const validateCorrectUntappdUrlInput = () => {
		if (selectedErrorTypeOption === ProductErrorType.WRONG_UNTAPPD && correctUntappdUrl !== '') {
			if (correctUntappdUrl.includes('untappd.com/b/')) {
				formValidation.correctUntappdUrl.hasError = false;
				formValidation.correctUntappdUrl.errorMessage = null;
			} else {
				formValidation.correctUntappdUrl.hasError = true;
				formValidation.correctUntappdUrl.errorMessage = 'Må være en gyldig Untappd url';
			}
		} else {
			formValidation.correctUntappdUrl.hasError = false;
			formValidation.correctUntappdUrl.errorMessage = null;
		}
	};

	const formHasErrors = () => {
		validateCorrectUntappdUrlInput();
		return Object.entries(formValidation).some(([key, value]) => value.hasError);
	};

	const detectClickOutside = ({ target }: MouseEvent | TouchEvent) => {
		if (target instanceof HTMLElement && target.id === 'report-dialog') {
			dialogElement?.close();
		}
	};

	onMount(() => {
		document.addEventListener('click', detectClickOutside);
		document.addEventListener('touchend', detectClickOutside);

		return () => {
			document.removeEventListener('click', detectClickOutside);
			document.removeEventListener('touchend', detectClickOutside);
		};
	});
</script>

<dialog
	id="report-dialog"
	class="backdrop:bg-black backdrop:bg-opacity-50 md:rounded-md max-w-screen-md max-h-dvh overflow-y-auto"
	bind:this={dialogElement}
>
	<div bind:this={dialogContentElement} class=" md:h-fit h-dvh w-full p-8">
		<form
			action="?/sendErrorReport"
			method="post"
			use:enhance={({ formData, formElement, cancel }) => {
				if (formHasErrors()) cancel();
				formData = addProductInfoToFormData(formData);
				return async ({ result }) => {
					if (result.type === 'success') {
						toast.push('Takk! Feilen har blitt rapportert', {
							theme: {
								'--toastColor': 'white',
								'--toastBackground': '#24a324'
							}
						});
						formElement.reset();
					} else {
						toast.push('Noe gikk galt, prøv igjen senere', {
							theme: {
								'--toastColor': 'white',
								'--toastBackground': 'rgb(255, 67, 67)'
							}
						});
					}
					closeReportDialog();
				};
			}}
		>
			<div class="w-full flex flex-row justify-between items-center mb-4">
				<h1 class="text-xl font-bold">Meld om feil</h1>
				<button type="button" class="p-4" on:click={closeReportDialog}><CloseIcon /></button>
			</div>
			<div class="text-sm">
				<p class="mb-4">
					Fant du noe feil med produktet? Vennligst oppgi en passende årsak under, så blir det
					fikset fortløpende.
				</p>
				<p>
					Merk at noen utdaterte ratinger kan forekomme grunnet begrensninger fra Untappd, så
					repporter kun om forskjellen er veldig stor eller har vært feil over lenger tid.
				</p>
			</div>
			<div class="mt-8">
				<h2 class="text-lg mb-4 font-semibold">{product?.vmp_name}</h2>
				<div class="flex flex-col gap-y-4">
					<Select
						bind:value={selectedErrorTypeOption}
						id="error-type-select"
						name="errorType"
						label="Årsak"
						options={errorTypeSelectOptions}
					/>

					{#if selectedErrorTypeOption === ProductErrorType.WRONG_UNTAPPD}
						<Input
							bind:value={correctUntappdUrl}
							id="correct-untappd-url-input"
							name="correctUntappdUrl"
							label="Lenke til riktig øl på Untappd (valgfritt)"
							placeholder={'F.eks https://untappd.com/b/nogne-o-all-sails-ripped/3625728'}
							alwaysShowOutline
							errorMessage={formValidation.correctUntappdUrl.errorMessage}
							on:change={() => validateCorrectUntappdUrlInput()}
						/>
					{/if}
					<TextArea
						name="userMessage"
						id="reason-input"
						label="Beskriv feilen (Valgfritt)"
						placeholder="F.eks: Dette er feil årgang. Riktig er 2023"
					/>
				</div>
			</div>
			<button type="submit" class="py-4 px-6 mt-4 text-white bg-wmp rounded-md">Send</button>
		</form>
	</div>
</dialog>
