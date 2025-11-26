<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import {
    PrismicImage,
    PrismicLink,
    PrismicRichText,
  } from "@prismicio/svelte";
  import type {
    SpeakersDocument,
    SponsorsDocument,
    SessionsDocument,
    TalkDocument,
  } from "../../prismicio-types";
  import { fade, fly } from "svelte/transition";
  import logo from "$lib/assets/logo.svg";
  import { onMount } from "svelte";
  import { asDate, isFilled } from "@prismicio/client";

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
  let selectedSession = $state<
    (SessionsDocument & { talks: TalkDocument[] }) | null
  >(null);
  let selectedTalk = $state<TalkDocument | null>(null);
  let mobileMenuOpen = $state(false);
  let activeSection = $state("top");
  let previousModal = $state<"session" | "speaker" | null>(null);

  const sponsors = data.sponsors;

  let tierOneSponsors: SponsorsDocument[] = [];
  sponsors.forEach((s) => {
    if (s.data.tier === 1) tierOneSponsors.push(s);
  });

  let tierTwoSponsors: SponsorsDocument[] = [];
  sponsors.forEach((s) => {
    if (s.data.tier === 2) tierTwoSponsors.push(s);
  });

  let tierThreeSponsors: SponsorsDocument[] = [];
  sponsors.forEach((s) => {
    if (s.data.tier !== 1 && s.data.tier !== 2) tierThreeSponsors.push(s);
  });

  const sessions = data.sessions;
  const talks = data.talks;

  function openModal(
    speaker: SpeakersDocument,
    from: "session" | "talk" | null = null
  ) {
    if (from === "talk") {
      previousModal = "session";
    } else if (from === "session") {
      previousModal = "session";
    } else {
      previousModal = null;
    }
    selectedSpeaker = speaker;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    selectedSpeaker = null;
    previousModal = null;
    // Only unlock scroll if no other modals are open
    if (!selectedSession && !selectedTalk) {
      document.body.style.overflow = "";
    }
  }

  function openSessionModal(
    session: SessionsDocument & { talks: TalkDocument[] }
  ) {
    selectedSession = session;
    previousModal = null;
    document.body.style.overflow = "hidden";
  }

  function closeSessionModal() {
    selectedSession = null;
    selectedTalk = null;
    selectedSpeaker = null;
    previousModal = null;
    document.body.style.overflow = "";
  }

  function openTalkModal(talk: TalkDocument) {
    previousModal = "session";
    selectedTalk = talk;
    document.body.style.overflow = "hidden";
  }

  function closeTalkModal() {
    selectedTalk = null;
    previousModal = null;
    // Only unlock scroll if no other modals are open
    if (!selectedSession && !selectedSpeaker) {
      document.body.style.overflow = "";
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      if (selectedTalk) {
        closeTalkModal();
      } else if (selectedSpeaker) {
        closeModal();
      } else if (selectedSession) {
        closeSessionModal();
      }
    }
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function formatTime(date: Date | null) {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getSpeakerById(id: string) {
    return speakers.find((s) => s.id === id);
  }

  onMount(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeSection = entry.target.id;
          }
        });
      },
      {
        rootMargin: "-20% 0px -80% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  });

  const navLinks = [
    { href: "#top", label: "Home" },
    { href: "#schedule", label: "Schedule" },
    { href: "#featured-presenters", label: "Presenters" },
    { href: "#map", label: "Map" },
    { href: "#sponsors", label: "Sponsors" },
    { href: "#all-presenters", label: "All Speakers" },
  ];
</script>

{#if selectedSpeaker}
  <!-- Speaker Modal Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    transition:fade
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] cursor-pointer"
    onclick={closeModal}
  ></div>

  <!-- Speaker Modal -->
  <div
    transition:fly={{ x: "-100%" }}
    class="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
  >
    <div
      class="bg-white rounded-sm w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        class="sticky top-0 bg-white border-b border-black/10 px-6 py-4 flex items-center justify-end"
      >
        <button
          type="button"
          onclick={() => {
            if (previousModal === "session") {
              closeModal();
            } else {
              selectedSpeaker = null;
              previousModal = null;
              if (!selectedSession && !selectedTalk) {
                document.body.style.overflow = "";
              }
            }
          }}
          class="text-black/60 hover:text-black transition-colors p-2 rounded"
          aria-label={previousModal === "session"
            ? "Back to session"
            : "Close modal"}
        >
          <i class="fa-sharp fa-solid fa-close fa-2xl"></i>
        </button>
      </div>

      <div class="p-3 md:p-8">
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
              <h2 class="text-black mb-2">{selectedSpeaker.data.name}</h2>
              {#if selectedSpeaker.data.title}
                <h4 class="text-primary mb-1">{selectedSpeaker.data.title}</h4>
              {/if}
              {#if selectedSpeaker.data.organization}
                <h6 class="text-black/60">
                  {selectedSpeaker.data.organization}
                </h6>
              {/if}
            </div>

            {#if selectedSpeaker.data.bio}
              <div class="text-black/80">
                <PrismicRichText field={selectedSpeaker.data.bio} />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if selectedSession && !selectedTalk && !selectedSpeaker}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    transition:fade
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
    onclick={closeSessionModal}
  ></div>

  <!-- Session Modal -->
  <div
    transition:fly={{ y: "100%" }}
    class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
  >
    <div
      class="bg-white rounded-sm w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="sticky top-0 bg-white border-b border-black/10 px-3 md:px-6 py-4 flex items-center justify-between"
      >
        <div>
          <h4 class="text-primary">{selectedSession.data.name}</h4>
          <p class="text-black/60 text-sm mt-1">
            {formatTime(asDate(selectedSession.data.start))} - {formatTime(
              asDate(selectedSession.data.end)
            )}
          </p>
        </div>
        <button
          type="button"
          onclick={closeSessionModal}
          class="text-black/60 hover:text-black transition-colors p-2 rounded"
          aria-label="Close modal"
        >
          <i class="fa-sharp fa-sharp fa-close fa-2xl"></i>
        </button>
      </div>

      <div class="p-6 md:p-8">
        {#if selectedSession.talks && selectedSession.talks.length > 0}
          <div class="space-y-6">
            {#each selectedSession.talks as talk}
              <div class="border-l-4 {talk.data.accent_color==='red'?'border-primary':talk.data.accent_color==='yellow'?'border-secondary':'border-dark'} pl-6 py-4">
                <div class="flex flex-col md:flex-row gap-6">
                  <div class="flex-1">
                    <div class="flex items-start justify-between gap-4 mb-3">
                      <button
                        type="button"
                        onclick={() => {
                          openTalkModal(talk);
                        }}
                        class="text-left flex-1 group"
                      >
                        <h5
                          class="text-black group-hover:text-primary transition cursor-pointer"
                        >
                          {talk.data.name}
                        </h5>
                      </button>
                      <div class="text-right shrink-0">
                        <span class="text-black/60 text-sm whitespace-nowrap">
                          {formatTime(asDate(talk.data.start_time))}
                        </span>
                        {#if talk.data.location}
                          <div class="text-black/50 text-xs mt-1">
                            {talk.data.location}
                          </div>
                        {/if}
                      </div>
                    </div>
                    <div class="flex flex-col gap-3 justify-between">
                      {#if isFilled.richText(talk.data.long_desc)}
                        <div class="text-black/70 text-sm mb-4">
                          {talk.data.subtitle}
                        </div>
                      {/if}

                      {#if isFilled.contentRelationship(talk.data.speaker)}
                        {@const speaker = getSpeakerById(
                          talk.data.speaker?.id || ""
                        )}
                        {#if speaker}
                          <button
                            type="button"
                            onclick={() => {
                              openModal(speaker, "session");
                            }}
                            class="items-center gap-3 group hover:opacity-80 transition hidden md:flex"
                          >
                            {#if speaker.data.headshot}
                              <div
                                class="w-12 h-12 rounded-full overflow-hidden bg-light/40"
                              >
                                <PrismicImage
                                  field={speaker.data.headshot}
                                  class="w-full h-full object-cover"
                                />
                              </div>
                            {/if}
                            <div class="text-left">
                              <div
                                class="text-sm font-medium text-black group-hover:text-primary transition"
                              >
                                {speaker.data.name}
                              </div>
                              {#if speaker.data.organization}
                                <div class="text-black/60">
                                  {speaker.data.organization}
                                </div>
                              {/if}
                            </div>
                          </button>
                        {/if}
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if selectedTalk && !selectedSpeaker}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    transition:fade
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 cursor-pointer"
    onclick={closeTalkModal}
  ></div>

  <!-- Talk Modal -->
  <div
    transition:fly={{ x: "100%" }}
    class="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none"
  >
    <div
      class="bg-white rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="sticky top-0 bg-white border-b border-black/10 px-3 md:px-8 py-4 flex items-start justify-between"
      >
        <div class="flex-1 pr-4">
          <h4 class="text-primary">{selectedTalk.data.name}</h4>
          {#if selectedTalk.data.subtitle}
            <p class="text-black/70 text-sm mt-1">
              {selectedTalk.data.subtitle}
            </p>
          {/if}
          <p class="text-black/60 text-sm mt-2">
            {formatTime(asDate(selectedTalk.data.start_time))}
            {#if selectedTalk.data.location}
              <span class="mx-2">•</span>
              <span>{selectedTalk.data.location}</span>
            {/if}
          </p>
        </div>
        <button
          type="button"
          onclick={() => {
            if (previousModal === "session") {
              closeTalkModal();
            } else {
              selectedTalk = null;
              previousModal = null;
              if (!selectedSession && !selectedSpeaker) {
                document.body.style.overflow = "";
              }
            }
          }}
          class="text-black/60 hover:text-black transition-colors h-fit w-fit mt-3"
          aria-label={previousModal === "session"
            ? "Back to session"
            : "Close modal"}
        >
          <i class="fa-sharp fa-solid fa-close fa-2xl"></i>
        </button>
      </div>

      <div class="p-6 md:p-8">
        {#if isFilled.image(selectedTalk.data.image)}
          <div class="mb-6 rounded-sm overflow-hidden bg-light/40">
            <PrismicImage
              field={selectedTalk.data.image}
              class="w-full h-auto object-cover"
            />
          </div>
        {/if}

        <div class="max-w-none">
          <PrismicRichText field={selectedTalk.data.long_desc} />
        </div>

        {#if isFilled.contentRelationship(selectedTalk.data.speaker)}
          {@const speaker = getSpeakerById(selectedTalk.data.speaker?.id || "")}
          {#if speaker}
            <div class="mt-6 pt-6 border-t border-black/10">
              <button
                type="button"
                onclick={() => {
                  openModal(speaker, "session");
                }}
                class="flex items-center gap-4 group hover:opacity-80 transition"
              >
                {#if speaker.data.headshot}
                  <div
                    class="w-16 h-16 rounded-full overflow-hidden bg-light/40"
                  >
                    <PrismicImage
                      field={speaker.data.headshot}
                      class="w-full h-full object-cover"
                    />
                  </div>
                {/if}
                <div class="text-left">
                  <div
                    class="font-medium text-black group-hover:text-primary transition"
                  >
                    {speaker.data.name}
                  </div>
                  {#if speaker.data.title}
                    <div class="text-sm text-black/70">
                      {speaker.data.title}
                    </div>
                  {/if}
                  {#if speaker.data.organization}
                    <div class="text-sm text-black/60">
                      {speaker.data.organization}
                    </div>
                  {/if}
                </div>
              </button>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}

<svelte:window bind:innerWidth={viewportWidth} onkeydown={handleKeydown} />

<nav
  class="h-16 fixed top-0 left-0 z-30 shadow-md bg-white/90 backdrop-blur-sm w-screen"
>
  <ContentWidth class="h-full flex flex-row justify-between items-center">
    <a href="https://umd.edu" target="_blank" class="bump">
      <img
        src={logo}
        class="h-8 hover:opacity-80 transition-opacity duration-300"
        alt="UMD Logo"
      />
    </a>

    <!-- Desktop Nav -->
    <div class="hidden lg:flex flex-row gap-6 justify-end items-center">
      {#each navLinks as link}
        <a
          href={link.href}
          class="bump transition hover:opacity-80 active:-translate-y-0.5"
          class:text-primary={activeSection === link.href.substring(1)}
          class:text-dark={activeSection !== link.href.substring(1)}
        >
          {link.label}
        </a>
      {/each}
      <div class="h-8 w-0.5 mx-4 bg-light"></div>
      <a
        href="https://app.certain.com/profile/form/index.cfm?PKformID=0x3463378abcd"
        class="text-primary w-fit hover:bg-primary hover:text-white transition active:-translate-y-1 py-3 px-4 rounded-sm bg-light"
      >
        RSVP
      </a>
    </div>

    <!-- Mobile Menu Button & RSVP -->
    <div class="lg:hidden flex items-center gap-4">
      <a
        href="https://app.certain.com/profile/form/index.cfm?PKformID=0x3463378abcd"
        class="text-primary w-fit hover:bg-primary hover:text-white transition active:-translate-y-1 py-3 px-4 rounded-sm bg-light"
      >
        RSVP
      </a>
      <button
        type="button"
        onclick={toggleMobileMenu}
        class="p-2 text-dark hover:text-primary transition"
        aria-label="Toggle menu"
      >
        <div class="md:w-12">
          <i
            class="fa-solid fa-sharp {mobileMenuOpen
              ? 'fa-close'
              : 'fa-bars'} fa-xl"
          ></i>
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

<PrismicImage
  field={content.backdrop}
  class="w-full top-1/2 -translate-y-1/2 right-1/12 fixed opacity-40 blur-xs"
/>

<section
  id="top"
  class="w-screen h-full min-h-lvh to-white/20 from-light/80 from-25% bg-radial-[at_75%_25%] py-32 relative add-noise overflow-y-visible"
>
  <ContentWidth class="h-full">
    <div class="md:w-1/2 flex flex-col md:pt-32 md:pr-16">
      <h3 class="text-primary">{content.s1_eyebrow}</h3>
      <h1 class="text-black">{content.s1_title}</h1>
      <h4 class="mt-4">{content.s1_dates}</h4>
    </div>
    <PrismicImage field={content.s1_image} class="md:hidden mt-6 blur-[1px]" />
  </ContentWidth>
  <PrismicImage
    field={content.s1_image}
    class="hidden w-1/2 top-1/2 -translate-y-1/2 right-0 md:block md:absolute blur-[1px]"
  />
</section>

<section
  id="qr"
  class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_75%] relative add-noise"
>
  <ContentWidth class="flex flex-col items-center justify-center gap-12">
    <h2 class="text-primary">{content.s2_rsvp_label}</h2>
    <PrismicLink field={content.s2_qr_link} class="flex flex-col items-center">
      <PrismicImage
        field={content.s2_qr}
        class="aspect-square w-full max-w-[66lvh]"
      />
      <div>click here</div>
    </PrismicLink>
  </ContentWidth>
</section>
<section
  id="schedule"
  class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_25%] pt-24 pb-6 relative add-noise overflow-y-visible"
>
  <ContentWidth class="flex flex-col gap-12">
    <h2 class="text-primary">Schedule</h2>

    {#if sessions && sessions.length > 0}
      {@const sessionsByDate = sessions.reduce(
        (acc, session) => {
          const date = asDate(session.data.start);
          if (date) {
            const dateKey = date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            if (!acc[dateKey]) {
              acc[dateKey] = [];
            }
            acc[dateKey].push(session);
          }
          return acc;
        },
        {} as Record<string, typeof sessions>
      )}

      <div class="space-y-12">
        {#each Object.entries(sessionsByDate) as [date, dateSessions]}
          <div class="space-y-4">
            <h4 class="text-primary">{date}</h4>

            {#each dateSessions as session}
              <button
                type="button"
                onclick={() => openSessionModal(session)}
                class="w-full text-left bg-white/60 backdrop-blur-sm rounded-sm p-6 shadow-md hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-primary"
              >
                <div class="flex flex-row items-center justify-between gap-4">
                  <div class="flex-1">
                    <h4 class="text-black group-hover:text-primary transition">
                      {session.data.name}
                    </h4>
                    {#if session.talks && session.talks.length > 0}
                      <div class="text-black/50 text-sm mt-3">
                        {session.talks.length}
                        {session.talks.length === 1 ? "event" : "events"}
                      </div>
                    {/if}
                  </div>

                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <div class="text-primary font-medium">
                      {formatTime(asDate(session.data.start))}
                    </div>
                    <div class="text-black/60 text-sm">
                      {formatTime(asDate(session.data.end))}
                    </div>
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-black/60">Schedule coming soon</div>
    {/if}
  </ContentWidth>
</section>

<section
  id="featured-presenters"
  class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_75%] pt-24 pb-6 relative add-noise overflow-y-visible"
>
  <ContentWidth class="flex flex-col gap-12">
    <h2 class="text-primary">Presenters</h2>
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
          <div class="flex flex-col gap-1.5">
            <h4 class="text-black">{speaker.data.name}</h4>

            {#if speaker.data.organization}
              <h6 class="text-primary">{speaker.data.organization}</h6>
            {/if}
          </div>
        </button>
      {/each}
    </div>
    <a
      href="/#all-presenters"
      class="text-primary w-fit hover:bg-primary hover:text-white transition active:-translate-y-1 py-3 px-4 rounded-sm bg-light shadow-md hover:shadow-xl"
    >
      See All Speakers</a
    >
  </ContentWidth>
</section>

<section
  id="map"
  class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_25%] pt-24 pb-6 relative add-noise overflow-y-visible"
>
  <ContentWidth class="flex flex-col gap-12">
    <h2 class="text-primary">Map</h2>
    <PrismicImage field={content.s5_map} class="w-full" />
    <div class="flex flex-col gap-1">
      <h4 class="text-primary mb-4">Address:</h4>
      <PrismicRichText field={content.s5_address} />
    </div>
  </ContentWidth>
</section>

<section
  id="sponsors"
  class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_75%] pt-24 pb-6 relative add-noise overflow-y-visible"
>
  <ContentWidth class="">
    <h2 class="text-primary">We Are Supported By:</h2>
    <div class="w-full flex flex-row flex-wrap items-center mt-12">
      {#each tierOneSponsors as sponsor, i}
        <div class="w-full md:w-1/3 aspect-square p-6 mx-auto">
          <PrismicLink
            field={sponsor.data.website}
            class="w-full h-full bg-light border-primary border-4 rounded-md flex items-center justify-center group"
          >
            <PrismicImage
              field={sponsor.data.logo}
              class="w-5/6 transition-transform duration-300 group-hover:scale-107"
            />
          </PrismicLink>
        </div>
      {/each}
    </div>
    <div class="w-full flex flex-row flex-wrap items-center mt-12">
      {#each tierTwoSponsors as sponsor, i}
        <div class="w-full md:w-1/3 lg:w-1/4 aspect-square p-6 mx-auto">
          <PrismicLink
            field={sponsor.data.website}
            class="w-full h-full bg-light border-secondary border-4 rounded-md flex items-center justify-center group"
          >
            <PrismicImage
              field={sponsor.data.logo}
              class="w-5/6 transition-transform duration-300 group-hover:scale-107"
            />
          </PrismicLink>
        </div>
      {/each}
    </div>

    <div class="w-full flex flex-row flex-wrap items-center mt-12">
      {#each tierThreeSponsors as sponsor, i}
        <div class="w-full md:w-1/3 lg:w-1/4 aspect-square p-6 mx-auto">
          <PrismicLink
            field={sponsor.data.website}
            class="w-full h-full bg-light border-dark border-4 rounded-md flex items-center justify-center group"
          >
            <PrismicImage
              field={sponsor.data.logo}
              class="w-5/6 transition-transform duration-300 group-hover:scale-107"
            />
          </PrismicLink>
        </div>
      {/each}
    </div>
  </ContentWidth>
</section>

<section
  id="all-presenters"
  class="w-screen to-white/20 from-light/80 from-25% bg-radial-[at_50%_25%] pt-24 pb-6 relative add-noise overflow-y-visible"
>
  <ContentWidth class="flex flex-col gap-12">
    <h2 class="text-primary">All Speakers</h2>
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
          <div class="flex flex-col gap-1.5">
            <h4 class="text-black">{speaker.data.name}</h4>
            {#if speaker.data.organization}
              <h6 class="text-primary">{speaker.data.organization}</h6>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </ContentWidth>
</section>
