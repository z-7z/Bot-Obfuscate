/**
 * Discord Components V2 Builder Utilities
 * 
 * This module provides helpers for creating REAL Discord Components V2 messages
 * using ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, etc.
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  MessageFlags
} = require('discord.js');

const { EMOTES } = require('../config/constants');

/**
 * Create a Components V2 message with proper flag
 * @param {Array} components - Array of component builders
 * @param {Object} options - Additional options
 * @returns {Object} Message options for Discord.js
 */
function createV2Message(components, options = {}) {
  return {
    ...options,
    components,
    flags: MessageFlags.IsComponentsV2
  };
}

/**
 * Create a text display component
 * @param {string} content - Text content
 * @returns {TextDisplayBuilder}
 */
function createTextDisplay(content) {
  return new TextDisplayBuilder()
    .setContent(content);
}

/**
 * Create a text section with emoji prefix
 * @param {string} emoji - Emoji ID or text
 * @param {string} text - Text content
 * @returns {TextDisplayBuilder}
 */
function createTextSection(emoji, text) {
  const emojiText = emoji ? `${emoji} ` : '';
  const fullText = emojiText + text;
  return createTextDisplay(fullText);
}

/**
 * Create a separator
 * @returns {SeparatorBuilder}
 */
function createSeparator() {
  return new SeparatorBuilder();
}

/**
 * Create a section with text displays
 * @param {Array<TextDisplayBuilder>} textBuilders - Array of TextDisplayBuilder
 * @returns {SectionBuilder}
 */
function createSection(...textBuilders) {
  const section = new SectionBuilder();
  textBuilders.forEach(tb => section.addTextDisplayComponents([tb]));
  return section;
}

/**
 * Create a container with sections and separators
 * @param {Array} children - Array of SectionBuilder, SeparatorBuilder, or other components
 * @returns {ContainerBuilder}
 */
function createContainer(...children) {
  const container = new ContainerBuilder();
  children.forEach(child => {
    if (child instanceof SectionBuilder) {
      container.addSectionComponents([child]);
    } else if (child instanceof SeparatorBuilder) {
      container.addSeparatorComponents([child]);
    } else if (child instanceof TextDisplayBuilder) {
      container.addTextDisplayComponents([child]);
    } else if (child instanceof ActionRowBuilder) {
      container.addActionRowComponents([child]);
    }
  });
  return container;
}

/**
 * Create an action row with buttons
 * @param {Array<ButtonBuilder>} buttons - Array of ButtonBuilder
 * @returns {ActionRowBuilder}
 */
function createActionRow(...buttons) {
  return new ActionRowBuilder()
    .addComponents(...buttons);
}

/**
 * Create a button with emoji
 * @param {string} customId - Button custom ID
 * @param {string} label - Button label
 * @param {string} style - Button style (Primary, Secondary, Success, Danger)
 * @param {string} emoji - Emoji ID or text
 * @returns {ButtonBuilder}
 */
function createButton(customId, label, style = 'Secondary', emoji = null) {
  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style);
  
  if (emoji) {
    button.setEmoji(emoji);
  }
  
  return button;
}

/**
 * Create a select menu
 * @param {string} customId - Menu custom ID
 * @param {string} placeholder - Placeholder text
 * @param {Array} options - Array of {label, value, default?, emoji?}
 * @param {number} minValues - Minimum values to select
 * @param {number} maxValues - Maximum values to select
 * @returns {StringSelectMenuBuilder}
 */
function createSelectMenu(customId, placeholder, options, minValues = 1, maxValues = 1) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues);
  
  options.forEach(opt => {
    const option = {
      label: opt.label,
      value: opt.value
    };
    if (opt.default !== undefined) option.default = opt.default;
    if (opt.emoji) option.emoji = opt.emoji;
    menu.addOptions([option]);
  });
  
  return menu;
}

/**
 * Create a toggle button (for boolean settings)
 * @param {string} customId - Button custom ID
 * @param {string} label - Button label
 * @param {boolean} isEnabled - Current state
 * @returns {ButtonBuilder}
 */
function createToggleButton(customId, label, isEnabled) {
  return createButton(
    customId,
    label,
    isEnabled ? 'Success' : 'Danger',
    isEnabled ? EMOTES.accept : EMOTES.false
  );
}

/**
 * Helper to build a complete V2 message
 */
class V2MessageBuilder {
  constructor() {
    this.components = [];
    this.currentSection = null;
  }

  /**
   * Add a text display directly
   */
  addText(emoji, text) {
    const textDisplay = createTextSection(emoji, text);
    
    // If we have a current section, add to it
    if (this.currentSection) {
      this.currentSection.addTextDisplayComponents([textDisplay]);
    } else {
      // Create a new section for this text
      const section = new SectionBuilder();
      section.addTextDisplayComponents([textDisplay]);
      this.components.push(section);
      this.currentSection = section;
    }
    
    return this;
  }

  /**
   * Add a heading (creates a new section)
   */
  addHeading(emoji, text) {
    // End current section
    this.currentSection = null;
    return this.addText(emoji, text);
  }

  /**
   * Add a separator (ends current section)
   */
  addSeparator() {
    this.currentSection = null;
    this.components.push(new SeparatorBuilder());
    return this;
  }

  /**
   * Add an action row with buttons
   */
  addActionRow(buttons) {
    this.currentSection = null;
    this.components.push(new ActionRowBuilder().addComponents(...buttons));
    return this;
  }

  /**
   * Add a single button in a new action row
   */
  addButton(customId, label, style = 'Secondary', emoji = null) {
    return this.addActionRow([createButton(customId, label, style, emoji)]);
  }

  /**
   * Add a select menu row
   */
  addSelectMenu(menu) {
    this.currentSection = null;
    this.components.push(new ActionRowBuilder().addComponents(menu));
    return this;
  }

  /**
   * Build the final message
   */
  build() {
    // Create container with all components
    const container = new ContainerBuilder();
    
    this.components.forEach(comp => {
      if (comp instanceof SectionBuilder) {
        container.addSectionComponents([comp]);
      } else if (comp instanceof SeparatorBuilder) {
        container.addSeparatorComponents([comp]);
      } else if (comp instanceof ActionRowBuilder) {
        container.addActionRowComponents([comp]);
      } else if (comp instanceof TextDisplayBuilder) {
        container.addTextDisplayComponents([comp]);
      }
    });
    
    return createV2Message([container]);
  }

  /**
   * Build with additional components outside container
   */
  buildWithComponents(additionalComponents = []) {
    const container = new ContainerBuilder();
    
    this.components.forEach(comp => {
      if (comp instanceof SectionBuilder) {
        container.addSectionComponents([comp]);
      } else if (comp instanceof SeparatorBuilder) {
        container.addSeparatorComponents([comp]);
      } else if (comp instanceof ActionRowBuilder) {
        container.addActionRowComponents([comp]);
      } else if (comp instanceof TextDisplayBuilder) {
        container.addTextDisplayComponents([comp]);
      }
    });
    
    return createV2Message([container, ...additionalComponents]);
  }

  /**
   * Reset and start over
   */
  reset() {
    this.components = [];
    this.currentSection = null;
    return this;
  }
}

module.exports = {
  // Builders
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
  
  // Helper functions
  createV2Message,
  createTextDisplay,
  createTextSection,
  createSeparator,
  createSection,
  createContainer,
  createActionRow,
  createButton,
  createSelectMenu,
  createToggleButton,
  
  // V2 Message Builder class
  V2MessageBuilder,
  
  // Constants
  EMOTES
};
