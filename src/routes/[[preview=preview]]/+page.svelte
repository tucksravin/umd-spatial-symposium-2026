<script lang='ts'>
  import ContentWidth from '$lib/components/ContentWidth/ContentWidth.svelte';
  import { PrismicImage, PrismicLink } from '@prismicio/svelte';


	let { data } = $props();

	let viewpoortWidth=$state(1024)

	let content = $state(data.page.data);

	$effect(()=> {data; content = data.page.data;})
</script>


<svelte:window bind:innerWidth={viewpoortWidth} />
	<PrismicImage field={content.s1_image} class="w-full h-full top-0 right-1/12 fixed opacity-40" />

<section id="top" class="w-screen h-lvh from-white/20 to-light/90 bg-linear-to-br py-32 relative add-noise overflow-y-visible">
	<ContentWidth class="h-full overflow-y-visible">
		<div class="w-1/2 h-full flex flex-col pt-32 pr-16">
			<h3 class="text-primary">{content.s1_eyebrow}</h3>
			<h1 class="text-black">{content.s1_title}</h1>
			<p class="mt-4">{content.s1_dates}</p>
		</div>
	</ContentWidth>
	<PrismicImage field={content.s1_image} class="w-1/2 top-1/2 -translate-y-1/2 right-0 absolute" />


</section>
<section id="qr" class="w-screen from-white/20 to-light/90 bg-linear-to-tr pb-16 relative add-noise flex flex-col items-center justify-center gap-12">
	<h2 class="text-primary">{content.s2_rsvp_label}</h2>
	<PrismicLink field={content.s2_qr_link} class="flex flex-col items-center">
		<PrismicImage field={content.s2_qr} class="aspect-square w-full max-w-[66lvh]" />
		<div>click here</div>
	</PrismicLink>
</section>