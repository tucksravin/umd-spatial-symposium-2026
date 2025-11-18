<script lang="ts">
    import logo from "$lib/assets/logo.svg"
  import ContentWidth from "./ContentWidth/ContentWidth.svelte";
</script>

<nav class="h-16  fixed top-0 left-0 z-30 shadow-md bg-white/90 w-screen">
    <ContentWidth class="h-full flex flex-row justify-between items-center">
        <a href="https://umd.edu" target="_blank" class="bump"><img src={logo} class="h-8 hover:opacity-80 transition-opacity duration-300" alt="to top" /></a>
        <div class="flex flex-row gap-6 justify-end items-center">
             <a href="https://app.certain.com/profile/form/index.cfm?PKformID=0x3463378abcd" class="bump text-primary hover:opacity-80 active:-translate-y-1 transition">RSVP</a>
            <!--<a href="/#top" class="bump text-dark hover:opacity-80 active:-translate-y-1 transition">To Top</a>-->
           
        </div>
    </ContentWidth>
</nav>