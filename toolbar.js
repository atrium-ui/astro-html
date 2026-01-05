const icon = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="15" height="15" viewBox="0 0 15 15">
  <defs>
    <clipPath id="clip-path">
      <rect id="Rectangle_1688" data-name="Rectangle 1688" width="15" height="15" transform="translate(11726 152)" fill="none"/>
    </clipPath>
  </defs>
  <g id="Mask_Group_4" data-name="Mask Group 4" transform="translate(-11726 -152)" clip-path="url(#clip-path)">
    <g fill="#fff" id="Group_423" data-name="Group 423" transform="translate(0.5)">
      <path id="Path_4183" data-name="Path 4183" d="M14.6,14H7.4A2.4,2.4,0,0,1,5,11.6V8.018H6.2V11.6a1.2,1.2,0,0,0,1.2,1.2h7.2a1.2,1.2,0,0,0,1.2-1.2V8.018H17V11.6A2.4,2.4,0,0,1,14.6,14Z" transform="translate(11722 152)"/>
      <path id="Path_4184" data-name="Path 4184" d="M3.385,9.591V1.927L.963,4.349a.564.564,0,0,1-.8-.8L3.54.176a.564.564,0,0,1,.684-.1h0l.01.006,0,0,.007,0,.006,0,0,0L4.264.1h0a.567.567,0,0,1,.083.069L7.733,3.55a.564.564,0,0,1-.8.8L4.513,1.926V9.591a.564.564,0,1,1-1.128,0Z" transform="translate(11736.949 162.579) rotate(180)"/>
    </g>
  </g>
</svg>
`;

export default {
  id: 'astro-html',
  name: 'Export emails',
  icon,
  init(canvas, eventTarget) {
    eventTarget.addEventListener('app-toggled', async (event) => {
      if (event.detail.state) {
        setTimeout(() => {eventTarget.dispatchEvent(
          new CustomEvent('toggle-app', {
            detail: { state: false },
          })
        )}, 150)
      }
    })
  }
}
