const {
  SlashCommandBuilder,
  ModalBuilder,
  LabelBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const submitHandler = require("./submitHandler");
const reactionWatcher = require("./reactionWatcher");

const MODAL_CUSTOM_ID = "creativeCallModal"; //required for picking the right modal

module.exports = {
  data: new SlashCommandBuilder()
    .setName("post-creative-call")
    .setDescription("Post a new creative call")
    .setDefaultMemberPermissions(0), // users or roles must be added via discord setings

  components: { [MODAL_CUSTOM_ID]: submitHandler },
  reactionWatchers: [reactionWatcher],


  async execute(interaction) {
    const modal = new ModalBuilder().setCustomId(MODAL_CUSTOM_ID).setTitle("New Creative Call");

    const mediumLabel = new LabelBuilder()
    .setLabel("Medium")
    .setDescription("e.g. photography")
    .setTextInputComponent(
      new TextInputBuilder()
      .setCustomId("medium")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    );

    const themeLabel = new LabelBuilder()
    .setLabel("Theme")
    .setTextInputComponent(
      new TextInputBuilder()
      .setCustomId("theme")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    );

    const timeLabel = new LabelBuilder()
    .setLabel("Time")
    .setDescription("e.g. 2 weeks")
    .setTextInputComponent(
      new TextInputBuilder()
      .setCustomId("time")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    );

    const deadlineLabel = new LabelBuilder()
    .setLabel("Deadline")
    .setDescription("e.g. 1/6/21")
    .setTextInputComponent(
      new TextInputBuilder()
      .setCustomId("deadline")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
    );
 
    modal.addLabelComponents(mediumLabel, themeLabel, timeLabel, deadlineLabel);

    await interaction.showModal(modal);
  },
}