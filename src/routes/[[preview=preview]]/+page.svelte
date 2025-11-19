<script lang='ts'>
  import ContentWidth from '$lib/components/ContentWidth/ContentWidth.svelte';
  import { PrismicImage, PrismicLink } from '@prismicio/svelte';


	let { data } = $props();

	let viewpoortWidth=$state(1024)

	let content = $state(data.page.data);

	$effect(()=> {data; content = data.page.data;})
</script>


<svelte:window bind:innerWidth={viewpoortWidth} />
	<PrismicImage field={content.s1_image} class="w-full top-1/2 -translate-y-1/2 right-1/12 fixed opacity-40 blur-xs" />

<section id="top" class="w-screen h-full min-h-lvh to-white/20 from-light/80 from-25% bg-radial-[at_75%_25%] py-32 relative add-noise overflow-y-visible">
	<ContentWidth class="h-full">
		<div class="md:w-1/2 flex flex-col md:pt-32 md:pr-16">
			<h3 class="text-primary">{content.s1_eyebrow}</h3>
			<h1 class="text-black">{content.s1_title}</h1>
			<p class="mt-4">{content.s1_dates}</p>
		</div>
		<PrismicImage field={content.s1_image} class="md:hidden mt-6 blur-[1px]" />
	</ContentWidth>
	<PrismicImage field={content.s1_image} class="hidden w-1/2 top-1/2 -translate-y-1/2 right-0 md:block md:absolute blur-[1px]" />


</section>
<section id="qr" class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_75%] pb-16 relative add-noise ">
	<ContentWidth class="flex flex-col items-center justify-center gap-12">
	<h2 class="text-primary">{content.s2_rsvp_label}</h2>
		<PrismicLink field={content.s2_qr_link} class="flex flex-col items-center">
			<PrismicImage field={content.s2_qr} class="aspect-square w-full max-w-[66lvh]" />
			<div>click here</div>
		</PrismicLink>
	</ContentWidth>
</section>
<section id="speakers" class="w-screen h-full min-h-lvh to-white/20 from-light/80 from-25% bg-radial-[at_50%_25%] py-32 relative add-noise overflow-y-visible">
	<ContentWidth></ContentWidth>
</section>