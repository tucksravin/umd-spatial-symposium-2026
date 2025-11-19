<script lang='ts'>
  import ContentWidth from '$lib/components/ContentWidth/ContentWidth.svelte';
  import { PrismicImage, PrismicLink, PrismicRichText } from '@prismicio/svelte';
  import type { SpeakersDocument, SponsorsDocument } from '../../prismicio-types';
  import { fade, fly } from 'svelte/transition';
  import logo from "$lib/assets/logo.svg"
  import { onMount } from 'svelte';
  
  let { data } = $props();
  let viewportWidth = $state(1024);
  let content = $state(data.page.data);
  
  $effect(() => {
    data; 
    content = data.page.data;
  });
  
  const speakers = data.speakers;
  let featuredSpeakers: SpeakersDocument[] = [];
  speakers.forEach((speaker) => {
    if (speaker.data.featured) featuredSpeakers.push(speaker);
  });

  let selectedSpeaker = $state<SpeakersDocument | null>(null);
  let mobileMenuOpen = $state(false);
  let activeSection = $state('top');

	const sponsors = data.sponsors;

  let tierOneSponsors: SponsorsDocument[] = [];
  sponsors.forEach((s)=>{if(s.data.tier===1)tierOneSponsors.push(s)})

  let tierTwoSponsors: SponsorsDocument[] = [];
  sponsors.forEach((s)=>{if(s.data.tier===2)tierTwoSponsors.push(s)})

  let tierThreeSponsors: SponsorsDocument[] = [];
  sponsors.forEach((s)=>{if(s.data.tier!==1&&s.data.tier!==2)tierThreeSponsors.push(s)})
  
  function openModal(speaker: SpeakersDocument) {
    selectedSpeaker = speaker;
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal() {
    selectedSpeaker = null;
    document.body.style.overflow = '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && selectedSpeaker) {
      closeModal();
    }
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  onMount(() => {
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeSection = entry.target.id;
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  });

  const navLinks = [
    { href: '#top', label: 'Home' },
    { href: '#schedule', label: 'Schedule' },
    { href: '#featured-presenters', label: 'Presenters' },
    { href: '#map', label: 'Map' },
    { href: '#sponsors', label: 'Sponsors' },
    { href: '#all-presenters', label: 'All Speakers' }
  ];
</script>

{#if selectedSpeaker}

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
	transition:fade
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
    onclick={closeModal}
  ></div>

  <!-- Modal -->
  <div transition:fly={{x:"-100%"}} class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
	<ContentWidth>
    <div 
      class="bg-white rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="sticky top-0 bg-white border-b border-black/10 px-6 py-4 flex items-center justify-end">

        <button 
          type="button"
          onclick={closeModal}
          class="text-black/60 hover:text-black transition-colors p-2 rounded"
          aria-label="Close modal"
        >
         <i class="fa-thin fa-sharp fa-close fa-2xl"></i>
        </button>
      </div>
      
      <div class="p-6 md:p-8">
        <div class="flex flex-col md:flex-row gap-6 md:gap-8">
          <div class="md:w-1/3 shrink-0">
            <div class="aspect-square overflow-hidden rounded-sm bg-light/40">
              <PrismicImage 
                field={selectedSpeaker.data.headshot} 
                class="w-full h-full object-cover" 
              />
            </div>
          </div>
          
          <div class="flex-1 flex flex-col gap-4">
            <div>
              <h3 class="text-black mb-2">{selectedSpeaker.data.name}</h3>
              {#if selectedSpeaker.data.title}
                <p class="text-primary">{selectedSpeaker.data.title}</p>
              {/if}
              {#if selectedSpeaker.data.organization}
                <p class="text-black/60">{selectedSpeaker.data.organization}</p>
              {/if}
            </div>
            
            {#if selectedSpeaker.data.bio}
              <div class="prose prose-sm max-w-none text-black/80">
                <PrismicRichText field={selectedSpeaker.data.bio} />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
	</ContentWidth>
  </div>
{/if}

<svelte:window bind:innerWidth={viewportWidth} onkeydown={handleKeydown} />

<nav class="h-16 fixed top-0 left-0 z-30 shadow-md bg-white/90 backdrop-blur-sm w-screen">
  <ContentWidth class="h-full flex flex-row justify-between items-center">
    <a href="https://umd.edu" target="_blank" class="bump">
      <img src={logo} class="h-8 hover:opacity-80 transition-opacity duration-300" alt="UMD Logo" />
    </a>

    <!-- Desktop Nav -->
    <div class="hidden lg:flex flex-row gap-6 justify-end items-center">
      {#each navLinks as link}
        <a 
          href={link.href} 
          class="bump transition hover:opacity-80 active:-translate-y-1"
          class:text-secondary={activeSection === link.href.substring(1)}
          class:text-dark={activeSection !== link.href.substring(1)}
        >
          {link.label}
        </a>
      {/each}
      <a 
        href="https://app.certain.com/profile/form/index.cfm?PKformID=0x3463378abcd" 
        class="bump text-primary hover:opacity-80 active:-translate-y-1 transition font-semibold"
      >
        RSVP
      </a>
    </div>

    <!-- Mobile Menu Button & RSVP -->
    <div class="lg:hidden flex items-center gap-4">
      <a 
        href="https://app.certain.com/profile/form/index.cfm?PKformID=0x3463378abcd" 
        class="bump text-primary hover:opacity-80 active:-translate-y-1 transition font-semibold"
      >
        RSVP
      </a>
      <button 
        type="button"
        onclick={toggleMobileMenu}
        class="p-2 text-dark hover:text-primary transition"
        aria-label="Toggle menu"
      >
	  <div class="w-12">
        <i class="fa-solid fa-sharp {mobileMenuOpen ? 'fa-close' : 'fa-bars'} fa-xl"></i>
	  </div>
      </button>
    </div>
  </ContentWidth>

  <!-- Mobile Menu Dropdown -->
  {#if mobileMenuOpen}
    <div 
      transition:fly={{ y: -20, duration: 200 }}
      class="lg:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-sm shadow-lg"
    >
      <ContentWidth class="flex flex-col py-4">
        {#each navLinks as link}
          <a 
            href={link.href} 
            onclick={closeMobileMenu}
            class="py-3 px-4 transition hover:bg-light rounded"
            class:text-secondary={activeSection === link.href.substring(1)}
            class:text-dark={activeSection !== link.href.substring(1)}
          >
            {link.label}
          </a>
        {/each}
      </ContentWidth>
    </div>
  {/if}
</nav>

<PrismicImage field={content.s1_image} class="w-full top-1/2 -translate-y-1/2 right-1/12 fixed opacity-40 blur-xs" />

<section id="top" class="w-screen h-full min-h-lvh to-white/20 from-light/80 from-25% bg-radial-[at_75%_25%] py-32 pt-48 relative add-noise overflow-y-visible">
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

<section id="qr" class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_75%] pb-16 relative add-noise">
  <ContentWidth class="flex flex-col items-center justify-center gap-12">
    <h2 class="text-primary">{content.s2_rsvp_label}</h2>
    <PrismicLink field={content.s2_qr_link} class="flex flex-col items-center">
      <PrismicImage field={content.s2_qr} class="aspect-square w-full max-w-[66lvh]" />
      <div>click here</div>
    </PrismicLink>
  </ContentWidth>
</section>
<section id="schedule" class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_25%] py-32 relative add-noise overflow-y-visible">
	 <ContentWidth class="flex"> <h3 class="text-primary">Schedule TBD</h3></ContentWidth>
</section>

<section id="featured-presenters" class="w-screen h-full min-h-lvh to-white/20 from-light/80 from-25% bg-radial-[at_50%_75%] py-32 relative add-noise overflow-y-visible">
  <ContentWidth class="flex flex-col gap-12">
    <h3 class="text-primary">Presenters</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each featuredSpeakers as speaker}
        <button 
          type="button"
          onclick={() => openModal(speaker)}
          class="flex flex-col gap-4 group text-left cursor-pointer transition-opacity hover:opacity-90 rounded-xs"
        >
          <div class="aspect-square overflow-hidden rounded-xs bg-light/40">
            <PrismicImage 
              field={speaker.data.headshot} 
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
          <div class="flex flex-col gap-1">
            <h4 class="text-black">{speaker.data.name}</h4>

            {#if speaker.data.organization}
              <p class="text-primary">{speaker.data.organization}</p>
            {/if}
          </div>
        </button>
      {/each}
    </div>
	<a href="/#all-presenters" class="text-primary w-fit hover:bg-primary hover:text-white transition active:-translate-y-1 py-3 px-4 rounded-sm bg-light shadow-md hover:shadow-xl"> See All Speakers</a>
  </ContentWidth>
</section>
<section id="map" class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_25%] py-32 relative add-noise overflow-y-visible">
	 <ContentWidth class="flex"> <h3 class="text-primary">Map TBD</h3></ContentWidth>
</section>
<section id="sponsors" class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_75%] py-32 relative add-noise overflow-y-visible">
	 <ContentWidth class=""> 
		<h2 class="text-primary">We Are Supported By:</h2>
		<div class="w-full flex flex-row flex-wrap items-center mt-12">
			{#each tierOneSponsors as sponsor, i }
				<div class="w-full md:w-1/3 aspect-square p-6 mx-auto">
					<PrismicLink field={sponsor.data.website} class="w-full h-full bg-light border-primary border-4 rounded-md flex items-center justify-center group">
						<PrismicImage field={sponsor.data.logo} class="w-5/6 transition-transform duration-300 group-hover:scale-107" />
					</PrismicLink>
				</div>
			{/each}
		</div>
				<div class="w-full flex flex-row flex-wrap items-center mt-12">
			{#each tierTwoSponsors as sponsor, i }
				<div class="w-full md:w-1/3 lg:w-1/4 aspect-square p-6 mx-auto">
					<PrismicLink field={sponsor.data.website} class="w-full h-full bg-light border-secondary border-4 rounded-md flex items-center justify-center group">
						<PrismicImage field={sponsor.data.logo} class="w-5/6 transition-transform duration-300 group-hover:scale-107" />
					</PrismicLink>
				</div>
			{/each}
		</div>
		
		<div class="w-full flex flex-row flex-wrap items-center mt-12"> 
			{#each tierThreeSponsors as sponsor, i }
				<div class="w-full md:w-1/3 lg:w-1/5 aspect-square p-6 mx-auto">
					<PrismicLink field={sponsor.data.website} class="w-full h-full bg-light border-dark border-4 rounded-md flex items-center justify-center group">
						<PrismicImage field={sponsor.data.logo} class="w-5/6 transition-transform duration-300 group-hover:scale-107" />
					</PrismicLink>
				</div>
			{/each}
		</div>
	</ContentWidth>
</section>

<section id="all-presenters" class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_25%] py-32 relative add-noise overflow-y-visible">
  <ContentWidth class="flex flex-col gap-12">
    <h3 class="text-primary">All Speakers</h3>
    <div class="flex flex-wrap justify-center gap-8">
      {#each speakers as speaker}
        <button 
          type="button"
          onclick={() => openModal(speaker)}
          class="flex flex-col gap-4 group text-left cursor-pointer transition-opacity hover:opacity-90 rounded-xs w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]"
        >
          <div class="aspect-square overflow-hidden rounded-xs bg-light/40">
            <PrismicImage 
              field={speaker.data.headshot} 
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
          <div class="flex flex-col gap-1">
            <h4 class="text-black">{speaker.data.name}</h4>
            {#if speaker.data.organization}
              <p class="text-primary">{speaker.data.organization}</p>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </ContentWidth>
</section>